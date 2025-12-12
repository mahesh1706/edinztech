import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/icons';
import Button from '../components/ui/Button';
import { getAdminFeedbacks, deleteFeedback, publishFeedback, unpublishFeedback } from '../lib/api';

export default function AdminFeedbacks() {
    console.log("AdminFeedbacks component loaded");
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const data = await getAdminFeedbacks();
            setFeedbacks(data);
        } catch (error) {
            console.error("Failed to fetch feedbacks", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will delete all collected responses too.")) return;
        try {
            await deleteFeedback(id);
            setFeedbacks(feedbacks.filter(f => f._id !== id));
        } catch (error) {
            alert("Failed to delete feedback");
        }
    };

    const handlePublishToggle = async (feedback) => {
        try {
            if (feedback.status === 'Published') {
                await unpublishFeedback(feedback._id);
            } else {
                await publishFeedback(feedback._id);
            }
            fetchFeedbacks();
        } catch (error) {
            alert("Action failed");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Icons.MessageSquare className="text-secondary bg-purple-50 p-1.5 rounded-lg w-10 h-10" />
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Feedback Surveys</h1>
                        <p className="text-sm text-gray-500">Manage program feedback and surveys.</p>
                    </div>
                </div>
                <Link to="/admin/feedbacks/new">
                    <Button className="flex items-center gap-2">
                        <Icons.Plus size={18} />
                        Create Feedback
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : feedbacks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <Icons.MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No surveys found</h3>
                    <p className="text-gray-500 mb-4">Create your first feedback survey.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Title</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Program</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {feedbacks.map(fb => (
                                <tr key={fb._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{fb.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{fb.programId?.title}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${fb.status === 'Published' ? 'bg-green-50 text-success' : 'bg-gray-100 text-gray-500'}`}>
                                            {fb.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handlePublishToggle(fb)}
                                                className={`p-2 transition-colors ${fb.status === 'Published' ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                                                title={fb.status === 'Published' ? 'Unpublish' : 'Publish'}
                                            >
                                                {fb.status === 'Published' ? <Icons.CheckCircle size={18} /> : <Icons.Upload size={18} />}
                                            </button>
                                            <Link to={`/admin/feedbacks/${fb._id}/edit`} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                <Icons.Edit size={18} />
                                            </Link>
                                            <button onClick={() => handleDelete(fb._id)} className="p-2 text-gray-400 hover:text-danger transition-colors">
                                                <Icons.Trash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
