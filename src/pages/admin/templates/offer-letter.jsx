import OfferLetterForm from '../../../components/forms/OfferLetterForm';
import { Icons } from '../../../components/icons';

export default function AdminTemplateOfferLetter() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-6">
                <Icons.Briefcase className="text-secondary bg-blue-50 p-1.5 rounded-lg w-10 h-10" />
                <div>
                    <h1 className="text-2xl font-bold text-secondary">Offer Letter Templates</h1>
                    <p className="text-sm text-gray-500">Design and manage offer letter layouts.</p>
                </div>
            </div>
            <OfferLetterForm onSubmit={(data) => alert('Template Saved!')} />
        </div>
    );
}
