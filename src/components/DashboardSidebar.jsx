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

export default function DashboardSidebar({ isOpen, onClose }) {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                bg-white rounded-xl shadow-sm border border-gray-100 p-6 
                fixed lg:sticky top-20 lg:top-24 left-0 z-40 h-[calc(100vh-5rem)] lg:h-auto lg:min-h-[calc(100vh-8rem)] 
                w-64 transform transition-transform duration-300 ease-in-out lg:transform-none lg:block
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="mb-6 pb-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-accent px-2">Student Portal</h2>
                    <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700">
                        <Icons.X size={20} />
                    </button>
                </div>
                <nav>
                    <SidebarItem to="/dashboard" end icon={Icons.Home}>Overview</SidebarItem>
                    <SidebarItem to="/dashboard/courses" icon={Icons.Courses}>My Courses</SidebarItem>
                    <SidebarItem to="/dashboard/internships" icon={Icons.Internships}>Internships</SidebarItem>
                    <SidebarItem to="/dashboard/workshops" icon={Icons.Workshops}>Workshops</SidebarItem>
                    <SidebarItem to="/dashboard/certificates" icon={Icons.Certificate}>Certificates</SidebarItem>
                    <SidebarItem to="/dashboard/offer-letters" icon={Icons.FileText}>Offer Letters</SidebarItem>
                    <SidebarItem to="/dashboard/quizzes" icon={Icons.Quiz}>Quizzes</SidebarItem>
                    <SidebarItem to="/dashboard/feedbacks" icon={Icons.MessageSquare}>Feedbacks</SidebarItem>
                </nav>
            </aside>
        </>
    );
}
