import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/icons';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import api from '../lib/api';
import AdminTable from '../components/AdminTable'; // Keep AdminTable import as it's used in JSX

export default function AdminPrograms() {
    const [searchTerm, setSearchTerm] = useState('');
    const [programs, setPrograms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get('/programs');
            setPrograms(data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch programs", err);
            setError("Failed to load programs");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-secondary">All Programs</h1>
                    <Link to="/admin/programs/new">
                        <Button className="gap-2">
                            <Icons.Plus size={18} /> Add Program
                        </Button>
                    </Link>
                </div>
                <p>Loading programs...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-secondary">All Programs</h1>
                    <Link to="/admin/programs/new">
                        <Button className="gap-2">
                            <Icons.Plus size={18} /> Add Program
                        </Button>
                    </Link>
                </div>
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-secondary">All Programs</h1>
                <Link to="/admin/programs/new">
                    <Button className="gap-2">
                        <Icons.Plus size={18} /> Add Program
                    </Button>
                </Link>
            </div>

            <AdminTable headers={['Program Name', 'Category', 'Price', 'Enrolled', 'Status', 'Actions']}>
                {programs.map(program => (
                    <tr key={program._id || program.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="font-medium text-secondary">{program.title}</div>
                            <div className="text-xs text-text-light">
                                {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()} • {program.mode}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${program.type === 'Course' ? 'bg-blue-50 text-blue-600' :
                                program.type === 'Internship' ? 'bg-purple-50 text-purple-600' :
                                    'bg-orange-50 text-orange-600'
                                }`}>
                                {program.type}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-light">
                            {program.paymentMode === 'Paid' ? `₹${program.fee}` : program.paymentMode}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-light">0</td>
                        <td className="px-6 py-4">
                            <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Active
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex gap-2">
                                <Link to={`/admin/programs/${program._id || program.id}/edit`}>
                                    <button className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Icons.Edit size={18} /></button>
                                </Link>
                                <button className="p-1 text-red-500 hover:bg-red-50 rounded"><Icons.Trash size={18} /></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </AdminTable>
        </div>
    );
}