import { useState, useEffect } from 'react';
import ProgramGrid from '../components/dashboard/ProgramGrid';
import { getMyEnrollments } from '../lib/api';

export default function DashboardWorkshops() {
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkshops = async () => {
            try {
                const enrollments = await getMyEnrollments();
                const myWorkshops = enrollments
                    .filter(e => {
                        const type = e.programType || e.program?.type;
                        return type === 'Workshop';
                    })
                    .map(e => ({
                        ...(e.program || {}),
                        status: e.status,
                        progress: e.progressPercent
                    }));
                setWorkshops(myWorkshops);
            } catch (err) {
                console.error("Failed to load workshops", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkshops();
    }, []);

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <ProgramGrid
            title="My Workshops"
            programs={workshops}
            type="workshops"
            emptyMessage="You haven't enrolled in any workshops yet."
        />
    );
}