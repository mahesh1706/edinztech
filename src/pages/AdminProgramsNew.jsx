import { useNavigate } from 'react-router-dom';
import ProgramForm from '../components/forms/ProgramForm';
import { Icons } from '../components/icons';

export default function AdminProgramsNew() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-6">
                <Icons.Plus className="text-primary bg-orange-50 p-1.5 rounded-lg w-10 h-10" />
                <div>
                    <h1 className="text-2xl font-bold text-secondary">Create New Program</h1>
                    <p className="text-sm text-gray-500">Add a new course, internship, or workshop to the catalog.</p>
                </div>
            </div>

            <ProgramForm />
        </div>
    );
}