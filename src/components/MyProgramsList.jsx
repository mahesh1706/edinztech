import { programs } from '../mock/data';
import ProgramCard from './ProgramCard';

export default function MyProgramsList({ categoryFilter }) {
    // Mock: assumes all programs of that category are enrolled for demo purposes
    // In real app, we would filter by user enrollment
    const enrolled = programs.filter(p => !categoryFilter || p.category === categoryFilter);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-secondary">My {categoryFilter ? categoryFilter + 's' : 'Programs'}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolled.map(p => (
                    <div key={p.id} className="relative h-full">
                        <ProgramCard program={p} />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-primary shadow-sm border border-orange-100 z-10">
                            In Progress
                        </div>
                    </div>
                ))}
                {enrolled.length === 0 && <p className="text-gray-500 col-span-full py-10 text-center">No enrolled {categoryFilter}s found.</p>}
            </div>
        </div>
    );
}
