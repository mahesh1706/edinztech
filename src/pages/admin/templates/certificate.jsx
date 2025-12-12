import CertificateForm from '../../../components/forms/CertificateForm';
import { Icons } from '../../../components/icons';

export default function AdminTemplateCertificate() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-6">
                <Icons.Award className="text-primary bg-orange-50 p-1.5 rounded-lg w-10 h-10" />
                <div>
                    <h1 className="text-2xl font-bold text-secondary">Certificate Templates</h1>
                    <p className="text-sm text-gray-500">Design and manage certificate layouts.</p>
                </div>
            </div>
            <CertificateForm onSubmit={(data) => alert('Template Saved!')} />
        </div>
    );
}
