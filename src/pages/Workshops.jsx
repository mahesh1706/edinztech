import { useState, useEffect } from 'react';
import ProgramCard from '../components/ProgramCard';
import { Icons } from '../components/icons';
import { getProgramsByType } from '../lib/api';

export default function Workshops() {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const data = await getProgramsByType('Workshop');
                setPrograms(data);
            } catch (err) {
                console.error("Failed to load workshops", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPrograms();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-orange-900 rounded-2xl p-8 mb-12 text-white relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="relative z-10 max-w-2xl">
                        <span className="inline-block px-3 py-1 bg-orange-800 rounded-full text-sm font-semibold mb-4 border border-orange-700">
                            Intensive Training
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Hands-on Workshops</h1>
                        <p className="text-orange-100 text-lg">
                            Short, focused sessions to master specific technologies quickly.
                        </p>
                    </div>
                    <Icons.Workshops className="absolute right-0 bottom-0 text-white/10 w-64 h-64 translate-x-12 translate-y-12 rotate-[-15deg]" />
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : programs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {programs.map((program) => (
                            <ProgramCard key={program._id || program.id} program={program} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-500">No active workshops found at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}