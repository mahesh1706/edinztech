import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/icons';
import DashboardCard from '../components/DashboardCard';
import { getDashboardOverview } from '../lib/api';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const user = userInfo.user || userInfo;

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardOverview();
                setStats(data);
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
                setError("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">{error}</div>;
    }

    const { totalEnrolled, activePrograms, completedPrograms, certificates, recentEnrollments } = stats;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary">Hello, {user.name} 👋</h1>
                    <p className="text-text-light">Here's your learning progress this week.</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/courses">
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-orange-600 transition-colors">
                            <Icons.Rocket size={18} />
                            Resume Learning
                        </button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardCard
                    title="Enrolled Courses"
                    value={totalEnrolled}
                    icon={Icons.Courses}
                    color="text-secondary"
                />
                <DashboardCard
                    title="Active Programs"
                    value={activePrograms}
                    icon={Icons.Internships}
                    color="text-primary"
                />
                <DashboardCard
                    title="Certificates"
                    value={certificates}
                    icon={Icons.Certificate}
                    color="text-green-600"
                />
                <DashboardCard
                    title="Completed"
                    value={completedPrograms}
                    icon={Icons.CheckCircle}
                    color="text-blue-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Enrolled Programs */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-secondary">Recent Enrollments</h2>
                        <Link to="/dashboard/courses" className="text-primary text-sm font-medium hover:underline">View All</Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {recentEnrollments.length === 0 ? (
                            <div className="text-center p-8 bg-white rounded-xl border border-gray-100">
                                <p className="text-gray-500 mb-4">You haven't enrolled in any programs yet.</p>
                                <Link to="/courses" className="text-primary font-bold hover:underline">Browse Programs</Link>
                            </div>
                        ) : (
                            recentEnrollments.map(enrollment => (
                                <div key={enrollment._id} className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                    <img
                                        src={enrollment.program?.image ?
                                            (enrollment.program.image.startsWith('http') ? enrollment.program.image : import.meta.env.VITE_API_URL + '/uploads/' + enrollment.program.image)
                                            : `https://placehold.co/600x400/orange/white?text=${enrollment.program?.title?.charAt(0)}`}
                                        alt={enrollment.program?.title}
                                        className="w-full md:w-48 h-32 object-cover rounded-lg"
                                    />
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-bold text-primary bg-orange-50 px-2 py-1 rounded mb-2 inline-block uppercase tracking-wider">{enrollment.program?.type}</span>
                                                <span className="text-xs text-gray-400 font-medium">{enrollment.status === 'active' ? 'Active' : 'Completed'}</span>
                                            </div>
                                            <h3 className="font-bold text-lg text-secondary line-clamp-1">{enrollment.program?.title}</h3>

                                            {/* Progress Bar Stub */}
                                            <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
                                                <div className="bg-primary h-2 rounded-full" style={{ width: `${enrollment.progressPercent || 0}%` }}></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{enrollment.progressPercent || 0}% Completed</p>
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <Link to={`/dashboard/program/${enrollment.program?._id}`} className="text-sm font-medium text-secondary hover:text-primary flex items-center gap-1 transition-colors">
                                                Continue <Icons.ChevronRight size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar - Recent Activity & Schedule */}
                <div className="space-y-6">
                    <div className="bg-blue-900 rounded-xl shadow-sm p-6 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">Upgrade Your Skills</h3>
                            <p className="text-blue-100 text-sm mb-4">Explore our new workshops and advanced courses.</p>
                            <Link to="/courses">
                                <button className="px-4 py-2 bg-white text-blue-900 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors">
                                    Explore Programs
                                </button>
                            </Link>
                        </div>
                        <Icons.Rocket className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32 rotate-[-15deg]" />
                    </div>
                </div>
            </div>
        </div>
    );
}