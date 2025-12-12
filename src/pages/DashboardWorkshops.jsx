import { programs } from '../mock/data';
import ProgramGrid from '../components/dashboard/ProgramGrid';

export default function DashboardWorkshops() {
    const enrolledWorkshops = programs.filter(p => p.category === 'Workshop'); // Mock data filter

    return (
        <ProgramGrid
            title="My Workshops"
            programs={enrolledWorkshops}
            type="workshops"
            emptyMessage="You haven't enrolled in any workshops yet."
        />
    );
}