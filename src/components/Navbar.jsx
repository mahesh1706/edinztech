import { Link, NavLink } from 'react-router-dom';
import { Icons } from './icons';

const NavItem = ({ to, children, icon: Icon }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${isActive ? 'border-primary text-primary' : 'border-transparent text-text hover:border-primary hover:text-primary'
            }`
        }
    >
        {Icon && <Icon size={18} className="text-secondary" />}
        {children}
    </NavLink>
);

export default function Navbar() {
    return (
        <nav className="w-full bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-secondary flex items-center gap-2">
                            <Icons.Rocket size={28} className="text-primary" />
                            <span>Edinz<span className="text-primary">Tech</span></span>
                        </Link>
                    </div>
                    <div className="hidden md:flex space-x-4 items-center">
                        <NavItem to="/" icon={Icons.Home}>Home</NavItem>
                        <NavItem to="/courses" icon={Icons.Courses}>Courses</NavItem>
                        <NavItem to="/internships" icon={Icons.Internships}>Internships</NavItem>
                        <NavItem to="/workshops" icon={Icons.Workshops}>Workshops</NavItem>
                        <NavItem to="/verify" icon={Icons.Verify}>Verify</NavItem>

                        <div className="ml-4 pl-4 border-l border-gray-200">
                            <Link to="/login">
                                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-orange-600 transition-colors shadow-sm font-medium">
                                    <Icons.Login size={18} className="text-white" />
                                    Login
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
