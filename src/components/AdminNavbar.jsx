import { Link } from 'react-router-dom';
import { Icons } from './icons';

export default function AdminNavbar() {
    return (
        <nav className="w-full bg-white shadow-sm border-b border-gray-100 z-40 sticky top-0">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/admin" className="text-xl font-bold text-secondary flex items-center gap-2">
                            <Icons.Rocket size={24} className="text-primary" />
                            <span>Edinz<span className="text-primary">Tech</span></span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
