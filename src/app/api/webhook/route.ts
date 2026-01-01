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
        const session = event.data.object as any;
        const { userId, serviceId, reservationDate, serviceDuration } = session.metadata;

        if (userId && serviceId && reservationDate) {
            const startTime = new Date(reservationDate);
            const endTime = addMinutes(startTime, parseInt(serviceDuration));

            // 1. Create Reservation in DB
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

            // 2. Send Slack Notification
            if (process.env.SLACK_WEBHOOK_URL) {
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
                                    text: `*Date:*\n${startTime.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`
                                },
                                {
                                    type: "mrkdwn",
                                    text: `*Amount:*\n¥${session.amount_total?.toLocaleString()}`
                                }
                            ]
                        }
                    ]
                });
            }
        }
    }

    return NextResponse.json({ received: true });
}

export const dynamic = 'force-dynamic';
