import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/icons';
import FeedbackForm from '../components/forms/FeedbackForm';
import { getPrograms, createFeedback } from '../lib/api';

export default function AdminFeedbacksNew() {
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

    const handleSubmit = async (data) => {
        try {
            await createFeedback(data);
            navigate('/admin/feedbacks');
        } catch (error) {
            console.error(error);
            alert("Failed to create feedback");
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-6">
                <Icons.MessageSquare className="text-secondary bg-purple-50 p-1.5 rounded-lg w-10 h-10" />
                <div>
                    <h1 className="text-2xl font-bold text-secondary">Create Feedback Survey</h1>
                    <p className="text-sm text-gray-500">Design a new feedback form for students.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100">
                <FeedbackForm
                    onSubmit={handleSubmit}
                    programs={programs}
                />
            </div>
        </div>
    );
}
