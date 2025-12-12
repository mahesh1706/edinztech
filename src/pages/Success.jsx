import { Link } from 'react-router-dom';
import { Icons } from '../components/icons';
import Button from '../components/ui/Button';

export default function Success() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-success animate-bounce">
                <Icons.Success size={48} />
            </div>
            <h1 className="text-4xl font-bold text-secondary mb-4">Payment Successful!</h1>
            <p className="text-xl text-text-light max-w-lg mb-8">
                Thank you for enrolling! Your payment has been processed successfully. You can now access your course in the dashboard.
            </p>
            <div className="flex gap-4">
                <Link to="/dashboard">
                    <Button size="lg">Go to Dashboard</Button>
                </Link>
                <Link to="/">
                    <Button variant="ghost" size="lg">Back to Home</Button>
                </Link>
            </div>
        </div>
    );
}