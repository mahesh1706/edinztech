import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/icons';
import Button from '../components/ui/Button';
import { getMyFeedbacks } from '../lib/api';

export default function DashboardFeedbacks() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const data = await getMyFeedbacks();
                setFeedbacks(processFeedbacks(data));
            } catch (error) {
                console.error("Failed to load feedbacks", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedbacks();
    }, []);

    const getStatusBadge = (status) => {
        const effectiveStatus = status || 'Available'; // Default to Available if backend doesn't send status
        switch (effectiveStatus) {
            case 'Available':
                return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">Available</span>;
            case 'Completed':
                return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">Completed</span>;
            case 'Scheduled':
                return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">Scheduled</span>;
            case 'Closed':
                return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">Closed</span>;
            default:
                return null;
        }
    };

    // Helper to inject status if missing
    const processFeedbacks = (data) => {
        return data.map(f => ({ ...f, userStatus: f.userStatus || 'Available' }));
    };

    if (loading) return (
        <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Program Feedback</h1>
                <p className="text-gray-500">Share your thoughts on the programs you've enrolled in.</p>
            </div>

            {feedbacks.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-300">
                    <Icons.MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No feedbacks available</h3>
                    <p className="text-gray-500">There are no feedback surveys available for you at this time.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {feedbacks.map(fb => (
                        <div key={fb._id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <Icons.MessageSquare className="text-secondary w-6 h-6" />
                                </div>
                                {getStatusBadge(fb.userStatus)}
                            </div>

                            <h3 className="font-bold text-lg text-gray-900 mb-1">{fb.title}</h3>
                            <p className="text-sm text-gray-500 mb-4">{fb.programId?.title}</p>

                            {fb.description && (
                                <p className="text-sm text-gray-600 mb-6 line-clamp-2">{fb.description}</p>
                            )}

                            <div className="mt-auto pt-4 border-t border-gray-50">
                                {fb.userStatus === 'Available' ? (
                                    <Link to={`/dashboard/feedbacks/${fb._id}`}>
                                        <Button className="w-full">
                                            Give Feedback
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button disabled variant="outline" className="w-full">
                                        {fb.userStatus === 'Completed' ? 'Submitted' : 'Not Available'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
