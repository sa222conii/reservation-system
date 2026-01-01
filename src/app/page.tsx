'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Calendar, CheckCircle2, Star } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-black text-pop-pink tracking-tighter">PopBooking!</h1>
        <div className="flex gap-4">
          {session ? (
            <>
              <Link href="/book" className="px-6 py-2 bg-pop-blue text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform">
                Book Now
              </Link>
              <button onClick={() => signOut()} className="px-6 py-2 bg-gray-100 font-bold rounded-full hover:bg-gray-200 transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <button onClick={() => signIn('google')} className="px-6 py-2 bg-pop-yellow text-black font-bold rounded-full shadow-lg border-2 border-black hover:bg-yellow-300 transition-colors">
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-block px-4 py-1 bg-pop-green text-white font-bold rounded-full text-sm mb-6">
            New & Easy!
          </div>
          <h2 className="text-6xl font-black text-gray-900 leading-tight mb-6">
            Book your <span className="text-pop-pink">Style</span> in seconds.
          </h2>
          <p className="text-xl text-gray-500 font-medium mb-10 leading-relaxed">
            The most colorful way to manage reservations. Instant notifications, secure payments, and zero hassle.
          </p>
          <div className="flex gap-4">
            <Link href={session ? "/book" : "/api/auth/signin"} className="px-8 py-4 bg-pop-pink text-white text-lg font-bold rounded-pop shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all border-2 border-black">
              Get Started
            </Link>
            <button className="px-8 py-4 bg-white text-black text-lg font-bold rounded-pop border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
              Learn More
            </button>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="relative">
          <div className="absolute top-0 right-0 w-72 h-72 bg-pop-yellow rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -left-4 w-72 h-72 bg-pop-blue rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pop-pink rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

          <div className="relative bg-white border-4 border-black rounded-pop-lg p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-20 bg-gray-100 rounded"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-pop-yellow/20 rounded-pop border-2 border-pop-yellow/50 flex items-center gap-3">
                <Calendar className="text-pop-yellow" />
                <span className="font-bold text-gray-800">Next: Hair Cut @ 14:00</span>
              </div>
              <div className="p-4 bg-pop-pink/20 rounded-pop border-2 border-pop-pink/50 flex items-center gap-3">
                <Star className="text-pop-pink" />
                <span className="font-bold text-gray-800">Premium Plan</span>
              </div>
              <div className="p-4 bg-pop-blue/20 rounded-pop border-2 border-pop-blue/50 flex items-center gap-3">
                <CheckCircle2 className="text-pop-blue" />
                <span className="font-bold text-gray-800">Payment Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
