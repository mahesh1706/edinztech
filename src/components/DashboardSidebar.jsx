import { NavLink } from 'react-router-dom';
import { Icons } from './icons';

const SidebarItem = ({ to, icon: Icon, children, end }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 mb-1 ${isActive
                ? 'bg-orange-50 text-primary font-medium border-r-2 border-primary'
                : 'text-text hover:bg-gray-50 hover:text-primary'
            }`
        }
    >
        {Icon && <Icon size={20} />}
        <span>{children}</span>
    </NavLink>
);

export default function DashboardSidebar() {
    return (
        <aside className="w-64 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[calc(100vh-8rem)] p-6 hidden lg:block sticky top-24 self-start">
            <div className="mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-accent px-2">Student Portal</h2>
            </div>
            <nav>
                <SidebarItem to="/dashboard" end icon={Icons.Home}>Overview</SidebarItem>
                <SidebarItem to="/dashboard/courses" icon={Icons.Courses}>My Courses</SidebarItem>
                <SidebarItem to="/dashboard/internships" icon={Icons.Internships}>Internships</SidebarItem>
                <SidebarItem to="/dashboard/workshops" icon={Icons.Workshops}>Workshops</SidebarItem>
                <SidebarItem to="/dashboard/certificates" icon={Icons.Certificate}>Certificates</SidebarItem>
                <SidebarItem to="/dashboard/quizzes" icon={Icons.Quiz}>Quizzes</SidebarItem>
                <SidebarItem to="/dashboard/feedbacks" icon={Icons.MessageSquare}>Feedbacks</SidebarItem>
            </nav>
        </aside>
    );
}
