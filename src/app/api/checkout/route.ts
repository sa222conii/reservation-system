import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { serviceId, date, time } = await req.json();

    if (!serviceId || !date || !time) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate a reservation start ISO string
    // Date is "YYYY-MM-DD", time is "HH:mm"
    // Note: Handling timezone properly is crucial in production, assuming JST/Local here for simplicity or UTC
    const startTime = new Date(`${date}T${time}:00`);

    // Find service details
    // For now, if DB is empty, fallback to mock data or error
    // In a real flow, you'd fetch from DB:
    // const service = await prisma.service.findUnique({ where: { id: serviceId } });

    // Mock Service lookup for dev if DB is empty
    let service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
        // Fallback for demo without seeding
        if (serviceId === 'cut') service = { id: 'cut', name: 'Hair Cut', price: 5000, duration: 60, description: '', image: '' } as any;
        else if (serviceId === 'color') service = { id: 'color', name: 'Coloring', price: 8000, duration: 90, description: '', image: '' } as any;
        else if (serviceId === 'spa') service = { id: 'spa', name: 'Head Spa', price: 4000, duration: 45, description: '', image: '' } as any;
        else return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'jpy',
                    product_data: {
                        name: service.name,
                        description: `${date} ${time}`,
                    },
                    unit_amount: service.price,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXTAUTH_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/book`,
        metadata: {
            userId: session.user.id,
            serviceId: service.id,
            reservationDate: startTime.toISOString(),
            serviceDuration: service.duration.toString(),
        },
    });

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
}
