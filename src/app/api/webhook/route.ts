import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { IncomingWebhook } from '@slack/webhook';
import { addMinutes } from 'date-fns';

const slack = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL ?? '');

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event;

    // Check if webhook secret is configured
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.warn('⚠️ STRIPE_WEBHOOK_SECRET is not set. Webhook signature verification is disabled.');
        // Parse the event without verification (only for initial setup)
        try {
            event = JSON.parse(body);
        } catch (err: any) {
            return NextResponse.json({ error: `JSON Parse Error: ${err.message}` }, { status: 400 });
        }
    } else {
        // Verify webhook signature when secret is available
        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err: any) {
            return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
        }
    }

    if (event.type === 'checkout.session.completed') {
        console.log('✅ Received checkout.session.completed event');
        const session = event.data.object as any;
        const { userId, serviceId, reservationDate, serviceDuration } = session.metadata;
        console.log('📋 Metadata:', { userId, serviceId, reservationDate, serviceDuration });

        if (userId && serviceId && reservationDate) {
            const startTime = new Date(reservationDate);
            const endTime = addMinutes(startTime, parseInt(serviceDuration));

            // Ensure Service exists (to handle mock data used in checkout)
            const serviceExists = await prisma.service.findUnique({ where: { id: serviceId } });
            if (!serviceExists) {
                console.log(`🛠 Service ${serviceId} not found in DB. Creating it...`);
                // Mock data definitions matching checkout route
                const MOCK_SERVICES: any = {
                    'cut': { name: 'Hair Cut', price: 5000, duration: 60 },
                    'color': { name: 'Coloring', price: 8000, duration: 90 },
                    'spa': { name: 'Head Spa', price: 4000, duration: 45 },
                };

                const mockData = MOCK_SERVICES[serviceId];
                if (mockData) {
                    await prisma.service.create({
                        data: {
                            id: serviceId,
                            ...mockData
                        }
                    });
                    console.log(`✅ Created service record for ${serviceId}`);
                } else {
                    console.warn(`⚠️ Unknown service ID: ${serviceId}. Creation might fail if FK constraint is enforced.`);
                }
            }

            // 1. Create Reservation in DB
            console.log('💾 Creating reservation in database...');
            const reservation = await prisma.reservation.create({
                data: {
                    userId,
                    serviceId,
                    startTime,
                    endTime,
                    status: 'CONFIRMED',
                    stripeSessionId: session.id,
                },
                include: {
                    user: true,
                    service: true,
                },
            });
            console.log('✅ Reservation created:', reservation.id);

            // 2. Send Slack Notification
            const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
            console.log('🔔 Checking Slack webhook URL...', slackWebhookUrl ? '✅ URL is set' : '❌ URL is NOT set');

            if (slackWebhookUrl) {
                try {
                    console.log('📤 Sending Slack notification...');
                    await slack.send({
                        text: `🎉 New Reservation Confirmed!`,
                        blocks: [
                            {
                                type: "header",
                                text: {
                                    type: "plain_text",
                                    text: "🎉 New Reservation Confirmed!",
                                    emoji: true
                                }
                            },
                            {
                                type: "section",
                                fields: [
                                    {
                                        type: "mrkdwn",
                                        text: `*Customer:*\n${reservation.user.name ?? 'Guest'} (${reservation.user.email})`
                                    },
                                    {
                                        type: "mrkdwn",
                                        text: `*Service:*\n${reservation.service.name}`
                                    },
                                    {
                                        type: "mrkdwn",
                                        text: `*Date:*\n${startTime.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}`
                                    },
                                    {
                                        type: "mrkdwn",
                                        text: `*Amount:*\n¥${session.amount_total?.toLocaleString()}`
                                    }
                                ]
                            }
                        ]
                    });
                    console.log('✅ Slack notification sent successfully!');
                } catch (error: any) {
                    console.error('❌ Failed to send Slack notification:', error.message);
                    console.error('Error details:', error);
                }
            } else {
                console.warn('⚠️ Skipping Slack notification - SLACK_WEBHOOK_URL not configured');
            }
        } else {
            console.warn('⚠️ Missing required metadata:', { userId, serviceId, reservationDate });
        }
    } else {
        console.log('ℹ️ Received event type:', event.type);
    }

    return NextResponse.json({ received: true });
}

export async function GET() {
    return NextResponse.json({ status: 'ok', message: 'Webhook endpoint is active' });
}

export const dynamic = 'force-dynamic';
