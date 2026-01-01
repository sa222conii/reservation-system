import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";

export default async function AdminPage() {
    const session = await getServerSession(authOptions);

    // Simple role check
    if (!session || session.user.role !== 'ADMIN') {
        // For demo purposes, we might skip this or allow anyone to view if 'ADMIN' role isn't set yet.
        // Uncomment below to strictly enforce:
        // return redirect('/');
    }

    // Fetch all reservations
    // Sorting by newest first
    const reservations = await prisma.reservation.findMany({
        include: {
            user: true,
            service: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-black text-pop-pink mb-8">Admin Dashboard</h1>

                <div className="bg-white border-4 border-black rounded-pop-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b-4 border-black">
                                <th className="p-4 font-black">ID</th>
                                <th className="p-4 font-black">Customer</th>
                                <th className="p-4 font-black">Service</th>
                                <th className="p-4 font-black">Date & Time</th>
                                <th className="p-4 font-black">Status</th>
                                <th className="p-4 font-black">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500 font-bold">
                                        No reservations yet.
                                    </td>
                                </tr>
                            ) : (
                                reservations.map((res) => (
                                    <tr key={res.id} className="border-b border-gray-200 hover:bg-yellow-50">
                                        <td className="p-4 font-mono text-sm">{res.id.slice(0, 8)}...</td>
                                        <td className="p-4">
                                            <div className="font-bold">{res.user.name}</div>
                                            <div className="text-xs text-gray-500">{res.user.email}</div>
                                        </td>
                                        <td className="p-4 font-bold">{res.service.name}</td>
                                        <td className="p-4">
                                            {format(new Date(res.startTime), 'yyyy/MM/dd HH:mm')}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-black
                        ${res.status === 'CONFIRMED' ? 'bg-pop-green text-white' :
                                                    res.status === 'CANCELLED' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                                {res.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button className="text-sm underline hover:text-pop-blue font-bold">Edit</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
