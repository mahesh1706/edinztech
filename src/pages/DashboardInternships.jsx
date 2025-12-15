import { useState, useEffect } from 'react';
import ProgramGrid from '../components/dashboard/ProgramGrid';
import { getMyEnrollments } from '../lib/api';

export default function DashboardInternships() {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInternships = async () => {
            try {
                const enrollments = await getMyEnrollments();
                const myInternships = enrollments
                    .filter(e => {
                        const type = e.programType || e.program?.type;
                        return type === 'Internship';
                    })
                    .map(e => ({
                        ...(e.program || {}),
                        status: e.status,
                        progress: e.progressPercent
                    }));
                setInternships(myInternships);
            } catch (err) {
                console.error("Failed to load internships", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInternships();
    }, []);

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <ProgramGrid
            title="My Internships"
            programs={internships}
            type="internships"
            emptyMessage="You haven't enrolled in any internships yet."
        />
    );
}