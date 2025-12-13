import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/icons';
import Button from '../components/ui/Button';
import { getAllQuizzes, deleteQuiz } from '../lib/api';

export default function AdminQuizzes() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchQuizzes();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, filterStatus]);

    const fetchQuizzes = async () => {
        try {
            setLoading(true); // Ensure loading state triggered on refresh
            const params = {};
            if (searchTerm) params.keyword = searchTerm;
            if (filterStatus !== 'All') params.status = filterStatus;

            const data = await getAllQuizzes(params);
            setQuizzes(data);
        } catch (error) {
            console.error("Failed to fetch quizzes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this quiz?")) return;
        try {
            await deleteQuiz(id);
            setQuizzes(quizzes.filter(q => q._id !== id));
        } catch (error) {
            console.error("Failed to delete quiz", error);
            alert("Failed to delete quiz");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Icons.Quiz className="text-secondary bg-orange-50 p-1.5 rounded-lg w-10 h-10" />
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Quiz Management</h1>
                        <p className="text-sm text-gray-500">Create and manage assessments for programs.</p>
                    </div>
                </div>
                <Link to="/admin/quizzes/new">
                    <Button className="flex items-center gap-2">
                        <Icons.Plus size={18} />
                        Create Quiz
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : quizzes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <Icons.Quiz className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No quizzes found</h3>
                    <p className="text-gray-500 mb-4">Get started by creating a new quiz.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Quiz Title</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Program</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Questions</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {quizzes.map(quiz => (
                                <tr key={quiz._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{quiz.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {quiz.program?.title || 'Unknown Program'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 text-center w-24 bg-gray-50 rounded-lg">
                                        {quiz.questions?.length || 0}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${quiz.status === 'Published' ? 'bg-green-50 text-success' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {quiz.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Currently no specific Edit page for generic quiz edits, 
                                                could link to program edit or a dedicated quiz edit page.
                                                For now, reusing the Delete action. */}
                                            <button
                                                onClick={() => handleDelete(quiz._id)}
                                                className="p-2 text-gray-400 hover:text-danger transition-colors"
                                                title="Delete"
                                            >
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
