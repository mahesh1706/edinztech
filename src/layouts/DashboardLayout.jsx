import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function DashboardLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="flex flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
                <DashboardSidebar />
                <main className="flex-grow w-full">
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    );
}
