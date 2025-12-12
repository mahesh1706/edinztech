import { programs } from '../mock/data';
import ProgramGrid from '../components/dashboard/ProgramGrid';

export default function DashboardInternships() {
    const enrolledInternships = programs.filter(p => p.category === 'Internship'); // Mock data filter

    return (
        <ProgramGrid
            title="My Internships"
            programs={enrolledInternships}
            type="internships"
            emptyMessage="You haven't enrolled in any internships yet."
        />
    );
}