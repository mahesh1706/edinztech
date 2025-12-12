import { Link } from 'react-router-dom';
import { Icons } from './icons';
import Button from './ui/Button';
import Card from './ui/Card';

export default function ProgramCard({ program }) {
    // Backend API uses _id, type (instead of category)
    const id = program._id || program.id;
    const category = program.type || program.category || 'Course';

    // Format Price
    const price = program.paymentMode === 'Free'
        ? 'Free'
        : (program.fee ? `₹${program.fee}` : 'Paid');

    // Calculate or use duration
    let durationString = program.duration || 'Self-paced';
    if (program.durationDays) {
        durationString = `${program.durationDays} Days`;
    } else if (program.startDate && program.endDate) {
        const start = new Date(program.startDate);
        const end = new Date(program.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        durationString = `${diffDays} Days`;
    }

    return (
        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full flex flex-col border-t-4 border-t-primary">
            <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide ${category === 'Course' ? 'bg-blue-50 text-blue-600' :
                    category === 'Internship' ? 'bg-green-50 text-green-600' :
                        'bg-orange-50 text-orange-600'
                    }`}>
                    {category}
                </span>
                <div className="flex items-center gap-1 text-orange-400 text-sm font-medium">
                    <span>★</span>
                    <span>{program.rating || '4.8'}</span>
                </div>
            </div>
            <h3 className="text-xl font-bold text-secondary mb-2">{program.title}</h3>
            <p className="text-text-light text-sm mb-6 line-clamp-2 flex-grow">{program.description}</p>

            <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-3 text-sm text-text-light">
                    <Icons.Duration size={16} className="text-primary" />
                    <span>{durationString}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-light">
                    <Icons.Home size={16} className="text-primary" />
                    <span>{program.mode}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-light">
                    <Icons.Fee size={16} className="text-primary" />
                    <span className="font-semibold text-secondary">{price}</span>
                </div>
            </div>

            <Link to={`/programs/${id}`} className="w-full mt-auto">
                <Button className="w-full justify-between group">
                    View Details
                    <Icons.ChevronRight size={16} className="text-white group-hover:translate-x-1 transition-transform" />
                </Button>
            </Link>
        </Card>
    );
}
