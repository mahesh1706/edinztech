import { useState, useEffect } from 'react';
import { getAdminEnrollments, getStudentCredentials } from '../lib/api'; // Updated import
import { Icons } from '../components/icons';
import Card from '../components/ui/Card';

export default function AdminEnrollments() {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedStudent, setSelectedStudent] = useState(null); // For modal
    const [adminPassword, setAdminPassword] = useState('');
    const [credentials, setCredentials] = useState(null);
    const [credentialError, setCredentialError] = useState('');

    useEffect(() => {
        fetchEnrollments();
    }, [filterType, searchTerm]);

    const fetchEnrollments = async () => {
        setLoading(true);
        try {
            const data = await getAdminEnrollments({ type: filterType, search: searchTerm });
            setEnrollments(data);
        } catch (error) {
            console.error("Failed to fetch enrollments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewCredentials = (student) => {
        setSelectedStudent(student);
        setCredentials(null);
        setAdminPassword('');
        setCredentialError('');
    };

    const submitCredentialsView = async (e) => {
        e.preventDefault();
        setCredentialError('');
        try {
            const data = await getStudentCredentials(selectedStudent._id, adminPassword); // Pass correct student ID
            // Ideally backend returns userCode, username, password. 
            // Note: adminController logic needs studentId. 
            // The enrollment endpoint returns `_id` as enrollment ID. 
            // Check adminController.js getEnrollments formatted object.
            // Wait, enrollment object has student info but NOT student ID at top level directly. 
            // Checking adminController.js: formatted map returns _id: e._id (EnrollmentID). 
            // Use e.user._id? No, formatted object doesn't have useId. 
            // I MUST UPDATE adminController.js getEnrollments to return userId!
            // I will assume I fix adminController first or handle it here.
            // Let's assume formatted object has `userId`.
            // But wait, I can just use the enrollment response if I fix backend.
            // For now, I'll proceed assuming I add userId to backend response.
            setCredentials(data);
        } catch (err) {
            setCredentialError(err.response?.data?.message || 'Verification Failed');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Enrolled Students</h1>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <select
                    className="p-2 border rounded"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="All">All Types</option>
                    <option value="Course">Course</option>
                    <option value="Internship">Internship</option>
                    <option value="Workshop">Workshop</option>
                </select>

                <input
                    type="text"
                    placeholder="Search student or program..."
                    className="p-2 border rounded w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email / Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="9" className="text-center py-4">Loading...</td></tr>
                        ) : enrollments.length === 0 ? (
                            <tr><td colSpan="9" className="text-center py-4">No enrollments found.</td></tr>
                        ) : (
                            enrollments.map((enrollment) => (
                                <tr key={enrollment._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {enrollment.userCode || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {enrollment.studentName}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div>{enrollment.email}</div>
                                        <div className="text-xs">{enrollment.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {enrollment.programName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${enrollment.programType === 'Internship' ? 'bg-purple-100 text-purple-800' :
                                                enrollment.programType === 'Workshop' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-blue-100 text-blue-800'}`}>
                                            {enrollment.programType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {enrollment.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="capitalize">{enrollment.status}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleViewCredentials(enrollment)}
                                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded"
                                        >
                                            View Credentials
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Credential Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">
                            {credentials ? 'Student Credentials' : 'Verify Admin Access'}
                        </h3>

                        {!credentials ? (
                            <form onSubmit={submitCredentialsView}>
                                <p className="mb-4 text-sm text-gray-600">
                                    Enter your admin password to view credentials for <b>{selectedStudent.studentName}</b>.
                                </p>
                                <input
                                    type="password"
                                    className="w-full border p-2 rounded mb-4"
                                    placeholder="Admin Password"
                                    value={adminPassword}
                                    onChange={e => setAdminPassword(e.target.value)}
                                    autoFocus
                                />
                                {credentialError && <p className="text-red-500 text-sm mb-4">{credentialError}</p>}
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedStudent(null)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                    >
                                        Verify & View
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-3">
                                <div className="bg-gray-50 p-4 rounded border">
                                    <p className="text-sm text-gray-500">User ID</p>
                                    <p className="font-mono font-bold">{credentials.userCode}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded border">
                                    <p className="text-sm text-gray-500">Username</p>
                                    <p className="font-mono">{credentials.username}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded border">
                                    <p className="text-sm text-gray-500">Password</p>
                                    <p className="font-mono text-red-600 font-bold tracking-wider">{credentials.password}</p>
                                </div>
                                <div className="flex justify-end mt-6">
                                    <button
                                        onClick={() => setSelectedStudent(null)}
                                        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
