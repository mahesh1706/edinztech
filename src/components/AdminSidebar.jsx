import { NavLink } from 'react-router-dom';
import { Icons } from './icons';

const SidebarItem = ({ to, icon: Icon, children, end }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 mb-1 ${isActive
                ? 'bg-blue-50 text-secondary font-medium border-r-2 border-secondary'
                : 'text-text hover:bg-gray-50 hover:text-secondary'
            }`
        }
    >
        {Icon && <Icon size={20} />}
        <span>{children}</span>
    </NavLink>
);

export default function AdminSidebar() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const user = userInfo.user || userInfo; // Handle nested structure

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6 hidden lg:block sticky top-0 h-screen overflow-y-auto">
            <div className="mb-8 flex items-center gap-2 px-2">
                <Icons.ShieldCheck className="text-secondary" size={24} />
                <h2 className="text-xl font-bold text-accent">Admin Panel</h2>
            </div>
            <nav>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Management</div>
                <SidebarItem to="/admin" end icon={Icons.Home}>Dashboard</SidebarItem>
                <SidebarItem to="/admin/programs" icon={Icons.Courses}>Programs</SidebarItem>
                <SidebarItem to="/admin/invite" icon={Icons.UserPlus}>Invite Student</SidebarItem>

                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-2">Assessment</div>
                <SidebarItem to="/admin/quizzes" icon={Icons.Quiz}>Quizzes</SidebarItem>
                <SidebarItem to="/admin/feedbacks" icon={Icons.MessageSquare}>Feedbacks</SidebarItem>
                <SidebarItem to="/admin/certificates" icon={Icons.Certificate}>Certificates</SidebarItem>

                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-2">System</div>
                <SidebarItem to="/admin/notifications" icon={Icons.Info}>Notifications</SidebarItem>
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 px-2 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-secondary truncate">{user.name || 'Admin'}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email || 'admin@edinztech.com'}</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        localStorage.removeItem('userInfo');
                        window.location.href = '/login';
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-danger hover:bg-red-50 transition-colors duration-200"
                >
                    <Icons.Logout size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
