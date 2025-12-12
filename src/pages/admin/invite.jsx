import InviteForm from '../../components/forms/InviteForm';
import { Icons } from '../../components/icons';

export default function AdminInvitePage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-2">
                <Icons.UserPlus className="text-primary bg-orange-50 p-1.5 rounded-lg w-10 h-10" />
                <div>
                    <h1 className="text-2xl font-bold text-secondary">Invite Student</h1>
                    <p className="text-sm text-gray-500">Add new users directly to programs.</p>
                </div>
            </div>

            <InviteForm />
        </div>
    );
}
