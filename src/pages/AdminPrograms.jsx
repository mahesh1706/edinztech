import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/icons/index';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import api, { publishCertificates, publishOfferLetters, exportPrograms, toggleProgramFeedback } from '../lib/api'; // Added toggleProgramFeedback
import AdminTable from '../components/AdminTable'; // Keep AdminTable import as it's used in JSX

export default function AdminPrograms() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [programs, setPrograms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPrograms();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, filterType]);

    const fetchPrograms = async () => {
        try {
            setIsLoading(true);
            const params = {};
            if (searchTerm) params.keyword = searchTerm;
            if (filterType !== 'All') params.type = filterType;

            const { data } = await api.get('/programs', { params });
            setPrograms(data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch programs", err);
            setError("Failed to load programs");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await exportPrograms();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'programs.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export failed", err);
            alert("Failed to export programs");
        }
    };

    const handlePublishCertificate = async (programId, title) => {
        if (!window.confirm(`Are you sure you want to publish certificates for "${title}"? This will issue certificates to all enrolled students.`)) return;

        try {
            const res = await publishCertificates(programId);
            alert(res.message);
        } catch (err) {
            console.error("Failed to publish certificates", err);
            alert(err.response?.data?.message || 'Failed to publish certificates');
        }
    };

    const handlePublishOfferLetter = async (programId, title) => {
        if (!window.confirm(`Are you sure you want to publish Offer Letters for "${title}"?`)) return;

        try {
            const res = await publishOfferLetters(programId);
            alert(res.message);
        } catch (err) {
            console.error("Failed to publish offer letters", err);
            alert(err.response?.data?.message || 'Failed to publish offer letters');
        }
    };

    const handleToggleFeedback = async (program) => {
        try {
            await toggleProgramFeedback(program._id || program.id);
            // Refresh list or update local state
            setPrograms(programs.map(p => {
                if ((p._id || p.id) === (program._id || program.id)) {
                    return { ...p, isFeedbackEnabled: !p.isFeedbackEnabled };
                }
                return p;
            }));
            // alert("Status updated!"); // Optional: Feedback for user
        } catch (error) {
            console.error("Failed to toggle feedback", error);
            alert("Failed to update status");
        }
    };

    if (isLoading && !programs.length) { // Only full page load initially
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-center contents-start"> {/* Keep header static */}
                    <h1 className="text-2xl font-bold text-secondary">All Programs</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExport} className="gap-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50">
                            <Icons.Download size={18} /> Export
                        </Button>
                        <Link to="/admin/programs/new">
                            <Button className="gap-2">
                                <Icons.Plus size={18} /> Add Program
                            </Button>
                        </Link>
                    </div>
                </div>
                <p>Loading programs...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header copy for consistency */}
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-secondary">All Programs</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport} className="gap-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50">
                        <Icons.Download size={18} /> Export
                    </Button>
                    <Link to="/admin/programs/new">
                        <Button className="gap-2">
                            <Icons.Plus size={18} /> Add Program
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search and Filter Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1">
                    <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search programs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <div className="w-full md:w-48">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-white cursor-pointer"
                        style={{ backgroundImage: 'none' }} // Remove browser arrow if using custom icon, or keep standard
                    >
                        <option value="All">All Types</option>
                        <option value="Course">Course</option>
                        <option value="Internship">Internship</option>
                        <option value="Workshop">Workshop</option>
                    </select>
                </div>
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
                        <td className="px-6 py-4 text-sm text-text-light">{program.enrolledCount || 0}</td>
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
                                <button
                                    onClick={() => handlePublishCertificate(program._id || program.id, program.title)}
                                    className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                                    title="Publish Certificates"
                                >
                                    <Icons.Award size={18} />
                                </button>
                                <button
                                    onClick={() => handleToggleFeedback(program)}
                                    className={`p-1.5 rounded-md transition-all duration-200 ${program.isFeedbackEnabled
                                        ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-200'
                                        : 'text-gray-400 hover:bg-gray-100'
                                        }`}
                                    title={program.isFeedbackEnabled ? "Feedback Enabled (Click to disable)" : "Feedback Disabled (Click to enable)"}
                                >
                                    {program.isFeedbackEnabled ? <Icons.MessageCircle size={18} /> : <Icons.MessageSquare size={18} />}
                                </button>
                                <button
                                    onClick={() => handlePublishOfferLetter(program._id || program.id, program.title)}
                                    className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                                    title="Publish Offer Letters"
                                >
                                    <Icons.FileText size={18} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </AdminTable>
        </div>
    );
}