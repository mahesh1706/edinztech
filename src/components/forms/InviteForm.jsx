import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { adminInviteStudent, getPrograms } from '../../lib/api';
import { Input } from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Icons } from '../icons';

const inviteSchema = z.object({
    name: z.string().optional(),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    phone: z.string().min(10, 'Mobile number must be at least 10 digits'),
    programId: z.string().min(1, 'Please select a program'),
    year: z.string().optional(),
    department: z.string().optional(),
    institutionName: z.string().optional(),
    registerNumber: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
});

export default function InviteForm() {
    const [programs, setPrograms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [apiError, setApiError] = useState(null);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(inviteSchema),
    });

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            const data = await getPrograms();
            setPrograms(data.map(p => ({
                label: `${p.title} (${p.type})`,
                value: p._id || p.id
            })));
        } catch (error) {
            console.error("Failed to fetch programs", error);
            setApiError("Failed to load programs list.");
        }
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        setApiError(null);
        setSubmitSuccess(false);

        try {
            await adminInviteStudent(data);
            setSubmitSuccess(true);
            reset();
            // Auto hide success message after 5 seconds
            setTimeout(() => setSubmitSuccess(false), 5000);
        } catch (error) {
            setApiError(error.response?.data?.message || error.message || "Failed to send invite");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
            <h2 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2">
                <Icons.Mail className="text-primary" />
                Invite Student
            </h2>
            <p className="text-sm text-gray-500 mb-6">
                Manually invite a student to a program. They will receive an email with login credentials.
            </p>

            {submitSuccess && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 animate-in fade-in">
                    <Icons.CheckCircle size={20} />
                    <span>Invitation sent successfully! The student has been enrolled.</span>
                </div>
            )}

            {apiError && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 animate-in fade-in">
                    <Icons.AlertCircle size={20} />
                    <span>{apiError}</span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Full Name"
                        placeholder="John Doe"
                        {...register('name')}
                        error={errors.name?.message}
                    />
                    <Input
                        label="Email Address"
                        placeholder="student@example.com"
                        type="email"
                        {...register('email')}
                        error={errors.email?.message}
                    />
                    <Input
                        label="Mobile Number"
                        placeholder="1234567890"
                        {...register('phone')}
                        error={errors.phone?.message}
                    />
                </div>

                {/* Academic Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h3 className="col-span-full text-sm font-semibold text-gray-700 mb-2">Academic Details</h3>
                    <Input
                        label="Institution Name"
                        placeholder="College/University"
                        {...register('institutionName')}
                    />
                    <Input
                        label="Register/Roll No"
                        placeholder="123456"
                        {...register('registerNumber')}
                    />
                    <Input
                        label="Department"
                        placeholder="Ex: CSE"
                        {...register('department')}
                    />
                    <Input
                        label="Year"
                        placeholder="Ex: 3rd Year"
                        {...register('year')}
                    />
                </div>

                {/* Address Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h3 className="col-span-full text-sm font-semibold text-gray-700 mb-2">Address Info</h3>
                    <Input
                        label="City"
                        placeholder="City"
                        {...register('city')}
                    />
                    <Input
                        label="State"
                        placeholder="State"
                        {...register('state')}
                    />
                    <Input
                        label="Pincode"
                        placeholder="560001"
                        {...register('pincode')}
                    />
                </div>

                <Controller
                    name="programId"
                    control={control}
                    render={({ field }) => (
                        <Select
                            label="Select Program"
                            placeholder="Choose a program..."
                            options={programs}
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.programId?.message}
                        />
                    )}
                />

                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        className="w-full md:w-auto min-w-[150px]"
                    >
                        Send Invite
                    </Button>
                </div>
            </form>
        </div>
    );
}
