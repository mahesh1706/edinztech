import { Icons } from './icons';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center text-text-light">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <Icons.Rocket size={24} className="text-primary" />
                    <span className="text-xl font-bold text-secondary">EdinzTech</span>
                </div>
                <p>© 2024 EdinzTech. All rights reserved.</p>
            </div>
        </footer>
    );
}
