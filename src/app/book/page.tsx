'use client';

import { useState } from 'react';
import Calendar from 'react-calendar';
import { addDays, format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
// import 'react-calendar/dist/Calendar.css'; // Using custom CSS in globals instead

type Service = {
    id: string;
    name: string;
    duration: number;
    price: number;
    icon: string;
};

const SERVICES: Service[] = [
    { id: 'cut', name: 'Hair Cut', duration: 60, price: 5000, icon: '✂️' },
    { id: 'color', name: 'Coloring', duration: 90, price: 8000, icon: '🎨' },
    { id: 'spa', name: 'Head Spa', duration: 45, price: 4000, icon: '💆' },
];

// Mock slots for now
const AVAILABLE_TIMES = ["10:00", "11:00", "13:00", "14:00", "16:00"];

export default function BookPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [date, setDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const handleBooking = async () => {
        if (!session) {
            // In a real app, redirect to signin. For now just alert.
            // You might want to router.push('/api/auth/signin') here.
            alert("Please login first!");
            return;
        }

        if (!selectedService || !selectedTime) return;

        try {
            const formattedDate = format(date, 'yyyy-MM-dd');

            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId: selectedService.id,
                    date: formattedDate,
                    time: selectedTime,
                }),
            });

            const { sessionId, error } = await res.json();

            if (error) {
                alert(error);
                return;
            }

            // Load Stripe Checkout
            const stripe = require('@stripe/stripe-js').loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
            (await stripe).redirectToCheckout({ sessionId });

        } catch (err) {
            console.error(err);
            alert("Failed to start checkout");
        }
    };

    return (
        <main className="min-h-screen bg-white p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-black text-center mb-10 text-pop-pink">
                    Make a Reservation
                </h1>

                {/* Progress Steps */}
                <div className="flex justify-center mb-12 gap-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl border-4 border-black ${step >= s ? 'bg-pop-yellow' : 'bg-gray-100 text-gray-300'}`}>
                            {s}
                        </div>
                    ))}
                </div>

                {/* Step 1: Select Service */}
                {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                        {SERVICES.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => { setSelectedService(service); setStep(2); }}
                                className="group relative bg-white border-4 border-black p-8 rounded-pop-lg hover:bg-pop-blue hover:text-white transition-all text-left shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            >
                                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
                                <h3 className="text-2xl font-black mb-2">{service.name}</h3>
                                <p className="font-bold opacity-70">{service.duration} min / ¥{service.price.toLocaleString()}</p>
                            </button>
                        ))}
                    </div>
                )}

                {/* Step 2: Select Date & Time */}
                {step === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4">
                        <div>
                            <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
                                <span className="bg-pop-pink text-white px-3 py-1 rounded-md text-sm">STEP 2</span>
                                Pick a Date
                            </h3>
                            <Calendar
                                onChange={(value) => setDate(value as Date)}
                                value={date}
                                minDate={new Date()}
                                className="w-full"
                                locale="en-US"
                            />
                        </div>

                        <div>
                            <h3 className="text-2xl font-black mb-6">Available Times for {format(date, 'MM/dd')}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {AVAILABLE_TIMES.map((time) => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={`p-4 border-4 border-black rounded-pop font-black text-lg transition-all ${selectedTime === time ? 'bg-pop-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-gray-50'}`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 flex gap-4">
                                <button onClick={() => setStep(1)} className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-pop">
                                    Back
                                </button>
                                <button
                                    disabled={!selectedTime}
                                    onClick={() => setStep(3)}
                                    className="flex-1 py-4 bg-black text-white font-bold rounded-pop disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && selectedService && (
                    <div className="max-w-md mx-auto bg-white border-4 border-black p-8 rounded-pop-lg shadow-[12px_12px_0px_0px_bg-pop-green] animate-in zoom-in-95">
                        <h3 className="text-2xl font-black mb-6 text-center">Summary</h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between border-b-2 border-dashed border-gray-300 pb-2">
                                <span className="font-bold text-gray-500">Service</span>
                                <span className="font-black text-lg">{selectedService.name}</span>
                            </div>
                            <div className="flex justify-between border-b-2 border-dashed border-gray-300 pb-2">
                                <span className="font-bold text-gray-500">Date</span>
                                <span className="font-black text-lg">{format(date, 'yyyy/MM/dd')}</span>
                            </div>
                            <div className="flex justify-between border-b-2 border-dashed border-gray-300 pb-2">
                                <span className="font-bold text-gray-500">Time</span>
                                <span className="font-black text-lg">{selectedTime}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="font-bold text-gray-500">Total</span>
                                <span className="font-black text-3xl text-pop-pink">¥{selectedService.price.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleBooking}
                            className="w-full py-4 bg-pop-green text-white text-xl font-black rounded-pop shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all border-2 border-black"
                        >
                            Confirm & Pay
                        </button>
                        <button onClick={() => setStep(2)} className="w-full mt-4 py-2 font-bold text-gray-400 hover:text-black">
                            Back to Date
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
