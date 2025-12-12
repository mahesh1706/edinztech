import { programs } from '../mock/data';
import DashboardCard from '../components/DashboardCard';
import { Icons } from '../components/icons';

export default function Admin() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-secondary">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="Total Students" value="1,245" icon={Icons.Workshops} color="text-blue-600 bg-blue-50" trend="+12% this month" />
                <DashboardCard title="Active Programs" value={programs.length} icon={Icons.Courses} color="text-orange-600 bg-orange-50" />
                <DashboardCard title="Revenue" value="₹ 4.2L" icon={Icons.Fee} color="text-green-600 bg-green-50" trend="+8% vs last month" />
                <DashboardCard title="Pending Verifications" value="12" icon={Icons.Verify} color="text-red-600 bg-red-50" />
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