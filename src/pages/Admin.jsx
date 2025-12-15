import { useState, useEffect } from 'react';
import DashboardCard from '../components/DashboardCard';
import { Icons } from '../components/icons';
import { getAdminDashboardStats } from '../lib/api';

export default function Admin() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        activePrograms: 0,
        revenue: { total: 0, today: 0, week: 0, month: 0 },
        pendingVerifications: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAdminDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to load admin stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-secondary">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="Total Students" value={stats.totalStudents} icon={Icons.Workshops} color="text-blue-600 bg-blue-50" trend={null} />
                <DashboardCard title="Active Programs" value={stats.activePrograms} icon={Icons.Courses} color="text-orange-600 bg-orange-50" />
                <DashboardCard
                    title="Revenue"
                    value={`₹ ${stats.revenue.total?.toLocaleString() ?? 0}`}
                    icon={Icons.Fee}
                    color="text-green-600 bg-green-50"
                    trend={`Day: ₹${stats.revenue.today?.toLocaleString() ?? 0} | Mo: ₹${stats.revenue.month?.toLocaleString() ?? 0}`}
                />
                <DashboardCard title="Pending Verifications" value={stats.pendingVerifications} icon={Icons.Verify} color="text-red-600 bg-red-50" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-secondary mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="p-4 rounded-lg border border-dashed border-gray-300 hover:border-primary hover:bg-orange-50 group flex flex-col items-center justify-center gap-2 transition-all">
                        <div className="p-2 bg-orange-100 text-primary rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                            <Icons.Plus size={24} />
                        </div>
                        <span className="text-sm font-medium text-secondary">New Program</span>
                    </button>
                    <button className="p-4 rounded-lg border border-dashed border-gray-300 hover:border-secondary hover:bg-blue-50 group flex flex-col items-center justify-center gap-2 transition-all">
                        <div className="p-2 bg-blue-100 text-secondary rounded-full group-hover:bg-secondary group-hover:text-white transition-colors">
                            <Icons.Quiz size={24} />
                        </div>
                        <span className="text-sm font-medium text-secondary">Create Quiz</span>
                    </button>
                    <button className="p-4 rounded-lg border border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 group flex flex-col items-center justify-center gap-2 transition-all">
                        <div className="p-2 bg-green-100 text-green-600 rounded-full group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <Icons.Verify size={24} />
                        </div>
                        <span className="text-sm font-medium text-secondary">Verify Student</span>
                    </button>
                </div>
            </div>
        </div>
    );
}