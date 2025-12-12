import { Icons } from '../components/icons';
import Button from '../components/ui/Button';

// Mock Certificates Data
const certificates = [
    {
        id: 1,
        title: "Full Stack Web Development",
        date: "Dec 15, 2023",
        id_code: "EDZ-FSD-2023-001",
        image: "https://via.placeholder.com/150", // Placeholder
    }
];

export default function DashboardCertificates() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-secondary">My Certificates</h1>

            {certificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map(cert => (
                        <div key={cert.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-40 bg-gray-100 flex items-center justify-center relative">
                                <Icons.Certificate className="text-gray-300 w-16 h-16" />
                                <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button size="sm" variant="secondary">Preview</Button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg text-secondary line-clamp-1">{cert.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">Issued on {cert.date}</p>
                                <div className="mt-4 flex gap-2">
                                    <Button size="sm" className="w-full flex items-center justify-center gap-2">
                                        <Icons.Download size={16} />
                                        Download
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <Icons.Award className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No certificates yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Complete a program to earn your first certificate.</p>
                </div>
            )}
        </div>
    );
}
