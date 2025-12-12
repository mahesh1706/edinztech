import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/icons';
import QuizForm from '../components/forms/QuizForm';
import { getPrograms } from '../lib/api';

export default function AdminQuizzesNew() {
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgramsData = async () => {
            try {
                const data = await getPrograms();
                setPrograms(data);
            } catch (error) {
                console.error("Failed to load programs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProgramsData();
    }, []);

    const handleSubmit = () => {
        alert('Quiz Created Successfully!');
        navigate('/admin/quizzes');
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-6">
                <Icons.Plus className="text-secondary bg-blue-50 p-1.5 rounded-lg w-10 h-10" />
                <div>
                    <h1 className="text-2xl font-bold text-secondary">Create New Quiz</h1>
                    <p className="text-sm text-gray-500">Create a new assessment for a program.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100">
                <QuizForm
                    onSubmit={handleSubmit}
                    programs={programs} // Pass programs for selection
                />
            </div>
        </div>
    );
}
