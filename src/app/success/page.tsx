import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-pop-yellow/20 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-10 rounded-pop-lg border-4 border-black shadow-pop text-center max-w-lg w-full">
                <div className="flex justify-center mb-8">
                    <CheckCircle className="w-24 h-24 text-pop-green animate-bounce" />
                </div>
                <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">You're Booked!</h1>
                <p className="text-xl text-gray-600 font-bold mb-10">
                    Thank you for your reservation.<br />
                    We've sent a confirmation to your email.
                </p>
                <Link href="/" className="inline-block w-full py-4 bg-pop-blue text-white font-black text-2xl rounded-pop border-2 border-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-pop-sm transition-all">
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
