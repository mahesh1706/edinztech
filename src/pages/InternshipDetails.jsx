import { useParams } from 'react-router-dom';
import { programs } from '../mock/data';
import { Icons } from '../components/icons';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function CourseDetails() {
    const { id } = useParams();
    // In a real app we'd fetch specific type, but for mock we just search all programs
    const program = programs.find(p => p.id === parseInt(id));

    if (!program) return <div className="p-10 text-center">Program not found</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-500">

            {/* Left Content */}
            <div className="lg:col-span-2 space-y-8">
                <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-secondary text-sm font-semibold mb-4">
                        {program.category}
                    </span>
                    <h1 className="text-4xl font-bold text-secondary mb-4">{program.title}</h1>
                    <p className="text-xl text-text-light">{program.description}</p>
                </div>

                <Card>
                    <h3 className="text-xl font-bold text-secondary mb-4 border-b border-gray-100 pb-2">About this Program</h3>
                    <p className="text-text-light leading-relaxed mb-6">
                        This comprehensive {program.category.toLowerCase()} is designed to take you from basics to advanced concepts.
                        Whether you are a beginner or looking to upskill, this program offers a structured learning path.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <h4 className="font-semibold text-secondary col-span-2">What you'll learn:</h4>
                        {program.tags.map(tag => (
                            <div key={tag} className="flex items-center gap-2 text-text-light">
                                <Icons.Success size={18} /> {tag}
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <h3 className="text-xl font-bold text-secondary mb-4 border-b border-gray-100 pb-2">Curriculum Overview</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-secondary flex items-center justify-center font-bold">
                                    {i}
                                </div>
                                <div>
                                    <h4 className="font-bold text-secondary">Module {i}: Core Concepts</h4>
                                    <p className="text-sm text-text-light mt-1">Introduction to fundamental topics and tools.</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
                <Card className="sticky top-24 border-t-4 border-t-primary">
                    <div className="mb-6">
                        <p className="text-sm text-text-light mb-1">Program Fee</p>
                        <h2 className="text-3xl font-bold text-primary">{program.fee}</h2>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <div className="flex items-center gap-3 text-text-light">
                                <Icons.Duration size={20} className="text-primary" />
                                <span>Duration</span>
                            </div>
                            <span className="font-semibold text-secondary">{program.duration}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <div className="flex items-center gap-3 text-text-light">
                                <Icons.Home size={20} className="text-primary" />
                                <span>Mode</span>
                            </div>
                            <span className="font-semibold text-secondary">{program.mode}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <div className="flex items-center gap-3 text-text-light">
                                <Icons.Date size={20} className="text-primary" />
                                <span>Start Date</span>
                            </div>
                            <span className="font-semibold text-secondary">{program.startDate}</span>
                        </div>
                    </div>

                    <Button className="w-full py-4 text-lg shadow-lg shadow-orange-100">Enroll Now</Button>
                    <p className="text-xs text-center text-gray-400 mt-4">30-day money-back guarantee</p>
                </Card>
            </div>

        </div>
    );
}