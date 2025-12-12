import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icons } from '../components/icons';
import FeedbackForm from '../components/forms/FeedbackForm';
import Button from '../components/ui/Button';
import { getPrograms, getFeedback, updateFeedback, exportFeedback } from '../lib/api';

export default function AdminFeedbacksEdit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [programs, setPrograms] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'stats'

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [programsData, feedbackData] = await Promise.all([
                    getPrograms(),
                    getFeedback(id)
                ]);
                setPrograms(programsData);
                setFeedback(feedbackData);
            } catch (error) {
                console.error("Failed to load data", error);
                alert("Failed to load feedback");
                navigate('/admin/feedbacks');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleSubmit = async (data) => {
        try {
            await updateFeedback(id, data);
            alert("Feedback updated successfully");
            navigate('/admin/feedbacks');
        } catch (error) {
            console.error(error);
            alert("Failed to update feedback: " + (error.response?.data?.message || error.message));
        }
    };

    const handleExport = async () => {
        try {
            const response = await exportFeedback(id);
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `feedback-export-${id}.csv`); // or dynamic name
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export failed", error);
            alert("Failed to export data");
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Icons.Edit className="text-secondary bg-purple-50 p-1.5 rounded-lg w-10 h-10" />
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Manage Feedback</h1>
                        <p className="text-sm text-gray-500">{feedback.title}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="bg-gray-100 p-1 rounded-lg flex">
                        <button
                            onClick={() => setActiveTab('edit')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'edit' ? 'bg-white shadow-sm text-secondary' : 'text-gray-500 hover:text-secondary'
                                }`}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'stats' ? 'bg-white shadow-sm text-secondary' : 'text-gray-500 hover:text-secondary'
                                }`}
                        >
                            Results
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'edit' ? (
                <div className="bg-white p-6 rounded-xl border border-gray-100">
                    <FeedbackForm
                        isEditing={true}
                        defaultValues={feedback}
                        programs={programs}
                        onSubmit={handleSubmit}
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">Total Responses</p>
                            <p className="text-3xl font-bold text-primary mt-2">{feedback.stats?.totalResponses || 0}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm md:col-span-2 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Export Logic</p>
                                <p className="text-sm text-gray-400 mt-1">Download all raw responses as CSV for analysis.</p>
                            </div>
                            <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
                                <Icons.Download size={18} /> Export CSV
                            </Button>
                        </div>
                    </div>

                    {/* Question Stats */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold mb-6">Question Analysis</h3>
                        <div className="space-y-8">
                            {feedback.questions.map((q, idx) => {
                                // Find stats for this question
                                const qStats = feedback.stats?.questionStats?.find(s => s._id === q.id);

                                return (
                                    <div key={q.id} className="border-b border-gray-50 last:border-0 pb-6 last:pb-0">
                                        <p className="font-medium text-gray-800 mb-3"><span className="text-gray-400 mr-2">{idx + 1}.</span>{q.text}</p>

                                        {/* Simple visualization based on type */}
                                        {(q.type === 'rating' || q.type === 'single-select' || q.type === 'multi-select') && (
                                            <div className="space-y-2 pl-6">
                                                {qStats?.counts?.map((c, i) => (
                                                    <div key={i} className="flex items-center gap-4 text-sm">
                                                        <span className="w-32 truncate text-gray-600" title={c.value}>{c.value}</span>
                                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary/60"
                                                                style={{ width: `${(c.count / (feedback.stats?.totalResponses || 1)) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="w-12 text-right font-medium text-gray-700">{c.count}</span>
                                                    </div>
                                                ))}
                                                {(!qStats || !qStats.counts) && <p className="text-sm text-gray-400 italic">No responses yet.</p>}
                                            </div>
                                        )}

                                        {q.type === 'text' && (
                                            <div className="pl-6">
                                                <p className="text-sm text-gray-400 italic">Text responses available in CSV export.</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
