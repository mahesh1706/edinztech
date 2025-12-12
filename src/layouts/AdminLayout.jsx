import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';

export default function AdminLayout() {
    return (
        <div className="min-h-screen flex bg-gray-50">
            <AdminSidebar />
            <main className="flex-grow w-full overflow-y-auto h-screen flex flex-col">
                <AdminNavbar />
                <div className="p-8 flex-grow">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
