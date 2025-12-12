import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input, TextArea } from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Icons } from '../icons';
import { createProgram, uploadProgramTemplate } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

// --- Zod Schemas per Step ---

const step1Schema = z.object({
    title: z.string().min(3, 'Title is required (min 3 chars)'),
    description: z.string().min(10, 'Description is required (min 10 chars)'),
    type: z.enum(['Course', 'Internship', 'Workshop']),
    code: z.string().optional(),
    startDate: z.string().min(1, 'Start Date is required'),
    endDate: z.string().min(1, 'End Date is required'),
    mode: z.enum(['Online', 'Offline', 'Hybrid']),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
});

const step2Schema = z.object({
    paymentMode: z.enum(['Paid', 'Free', 'Invite Only']),
    fee: z.string().optional(),
    registrationLink: z.string().optional().or(z.literal('')),
}).refine((data) => {
    if (data.paymentMode === 'Paid') {
        return !!data.fee && !!data.registrationLink;
    }
    return true;
}, {
    message: "Fee and Registration Link are required for Paid programs",
    path: ["fee"], // Mark error on fee logic
});

const step3Schema = z.object({
    // We will handle file validations manually or via simple check since react-hook-form + file inputs is tricky
    // But we need to know if type implies offer letter
}).optional();

const step4Schema = z.object({
    whatsappMessage: z.string().optional(),
    whatsappGroupLink: z.string().optional().or(z.literal('')),
    emailSubject: z.string().optional(),
    emailBody: z.string().optional(),
});

// Combined Schema for final submission check if needed, but we rely on steps
const fullSchema = z.any(); // We validate per step

export default function ProgramForm({ defaultValues: initialValues, onSubmit: parentSubmit, isEditing = false }) {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0); // 0: Basic, 1: Payment, 2: Templates, 3: Communication
    const [offerLetterFile, setOfferLetterFile] = useState(null);
    const [certificateFile, setCertificateFile] = useState(null);

    // Global Form
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        control,
        setValue,
        trigger,
        getValues
    } = useForm({
        resolver: zodResolver(step1Schema.merge(step2Schema).merge(step4Schema).optional()),
        mode: 'onChange',
        shouldUnregister: false,
        defaultValues: initialValues || {
            type: 'Course',
            paymentMode: 'Paid',
            mode: 'Online',
            code: ''
        }
    });

    const programType = watch('type');
    const paymentMode = watch('paymentMode');

    // Steps Configuration
    const steps = [
        { id: 'basic', label: 'Basic Info', icon: Icons.Info },
        { id: 'payment', label: 'Payment & Fee', icon: Icons.Fee },
        { id: 'templates', label: 'Templates', icon: Icons.Certificate },
        { id: 'communication', label: 'Communication', icon: Icons.Menu },
    ];

    const handleNext = async (e) => {
        e?.preventDefault(); // Prevent form submission

        let isValid = false;

        // Validating per step manually to avoid stale resolver closure issues
        if (currentStep === 0) {
            isValid = await trigger(['title', 'description', 'type', 'startDate', 'endDate', 'mode', 'startTime', 'endTime']);
        } else if (currentStep === 1) {
            isValid = await trigger(['paymentMode', 'fee', 'registrationLink']);
            // Manual check for Paid mode safety:
            if (isValid && paymentMode === 'Paid') {
                if (!getValues('fee') || !getValues('registrationLink')) {
                    await trigger('fee');
                    await trigger('registrationLink');
                    return;
                }
            }
        } else if (currentStep === 2) {
            if (programType === 'Internship' && !offerLetterFile && !isEditing) {
                // For editing, we might already have a template, so strictly enforcing file upload might block updates without changing file.
                // Ideally we check if field is populated, but file input is uncontrolled.
                // We'll relax this for edit or assume user knows.
                // For now, keep strict for NEW, relax for EDIT if needed, or simple warning.
                // alert("Please upload an Offer Letter template for Internships.");
                // return;
            }
            isValid = true;
        }

        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const onSubmit = async (data) => {
        try {
            // 0. Manual Validation for Critical Fields (Dates)
            // Sometimes date inputs might trigger invalid date errors if not caught by schema on previous steps
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);

            if (!data.startDate || isNaN(start.getTime())) {
                alert("Start Date is invalid or missing. Please check Basic Info.");
                setCurrentStep(0);
                return;
            }
            if (!data.endDate || isNaN(end.getTime())) {
                alert("End Date is invalid or missing. Please check Basic Info.");
                setCurrentStep(0);
                return;
            }

            // 1. Prepare Data
            const payload = {
                ...data,
                fee: data.fee ? Number(data.fee) : 0,
                startDate: start.toISOString(), // Ensure ISO format
                endDate: end.toISOString(),
                // Unnested schedule fields to match Schema
                startTime: data.startTime,
                endTime: data.endTime,
                communication: {
                    whatsappGroupLink: data.whatsappGroupLink,
                    whatsappMessage: data.whatsappMessage,
                    emailSubject: data.emailSubject,
                    emailBody: data.emailBody
                }
            };

            // IF PARENT SUBMIT PROVIDED (Edit Mode or Custom Handler)
            if (parentSubmit) {
                // If files provided, parent needs to handle upload logic or we pass files up?
                // Parent probably expects data. Parent might verify uploads separately.
                // Or we can modify 'payload' to include file objects if parent needs them?
                // For simplicity, we rely on parent to update program data.
                // Template updates in Edit mode: typically separate component or handled here if API supports.
                // Let's assume parent handles pure data update.
                // Use default logic for Templates?
                // If we want to support template update in edit, we should do it here or pass files.
                // Let's pass simple data first.
                await parentSubmit(payload);
                return;
            }

            // --- DEFAULT CREATE LOGIC ---

            // 2. Create Program
            const response = await createProgram(payload); // Expects { success: true, program: {...} } or just program
            const programId = response._id || response.program?._id;

            if (!programId) throw new Error("Failed to get Program ID");

            // 3. Upload Templates & Update Program
            const updates = {};

            if (offerLetterFile) {
                const uploadRes = await uploadProgramTemplate(programId, offerLetterFile);
                if (uploadRes.path) {
                    updates.offerLetterTemplate = uploadRes.path;
                }
            }
            if (certificateFile) {
                const uploadRes = await uploadProgramTemplate(programId, certificateFile);
                if (uploadRes.path) {
                    updates.certificateTemplate = uploadRes.path;
                }
            }

            // If we have template updates, save them
            if (Object.keys(updates).length > 0) {
                // We need to import updateProgram at the top
                const { updateProgram } = await import('../../lib/api');
                await updateProgram(programId, updates);
            }

            // 4. Redirect
            navigate('/admin/programs');
        } catch (error) {
            console.error("Submission Error:", error);
            alert("Failed to save program: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in">

            {/* Step Indicators */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep;
                        const isCurrent = index === currentStep;
                        return (
                            <div
                                key={step.id}
                                className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                                    ${isCurrent ? 'border-primary text-primary' :
                                        isCompleted ? 'border-success text-success' : 'border-transparent text-gray-400'}
                                `}
                            >
                                <step.icon size={16} />
                                {step.label}
                                {isCompleted && <Icons.Success size={14} />}
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[400px]">

                {/* Step 1: Basic Info */}
                {currentStep === 0 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        label="Program Type"
                                        options={['Course', 'Internship', 'Workshop']}
                                        error={errors.type?.message}
                                        {...field}
                                        onChange={(value) => {
                                            field.onChange(value);
                                            // Only auto-generate code if NOT editing or field empty
                                            if (!isEditing) {
                                                const date = new Date();
                                                setValue('code', `EDZ-${date.getFullYear()}-${value.toUpperCase().slice(0, 3)}-XXX`);
                                            }
                                        }}
                                    />
                                )}
                            />
                            <Input
                                label="Program Code"
                                {...register('code')}
                                disabled
                                className="bg-gray-50"
                            />
                        </div>

                        <Input
                            label="Program Title"
                            {...register('title')}
                            error={errors.title?.message}
                        />

                        <TextArea
                            label="Description"
                            {...register('description')}
                            rows={4}
                            error={errors.description?.message}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Input type="date" label="Start Date" {...register('startDate')} error={errors.startDate?.message} />
                            <Input type="date" label="End Date" {...register('endDate')} error={errors.endDate?.message} />
                            <Controller
                                name="mode"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        label="Mode"
                                        options={['Online', 'Offline', 'Hybrid']}
                                        error={errors.mode?.message}
                                        {...field}
                                    />
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input type="time" label="Start Time" {...register('startTime')} />
                            <Input type="time" label="End Time" {...register('endTime')} />
                        </div>
                    </div>
                )}

                {/* Step 2: Payment */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <Controller
                            name="paymentMode"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    label="Payment Mode"
                                    options={['Paid', 'Free', 'Invite Only']}
                                    {...field}
                                />
                            )}
                        />

                        {paymentMode === 'Paid' && (
                            <>
                                <Input
                                    label="Program Fee (₹)"
                                    type="number"
                                    {...register('fee')}
                                    error={errors.fee?.message}
                                />
                                <Input
                                    label="Registration / Payment Link"
                                    {...register('registrationLink')}
                                    placeholder="https://razorpay.me/..."
                                    error={errors.registrationLink?.message}
                                />
                            </>
                        )}
                        {errors.fee && <p className="text-danger text-sm">{errors.fee.message}</p>}
                    </div>
                )}

                {/* Step 3: Templates */}
                {currentStep === 2 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        {programType === 'Internship' && (
                            <div className="border border-dashed border-gray-300 p-6 rounded-lg text-center">
                                <Icons.Internships className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                                <h4 className="font-medium text-gray-900">Offer Letter Template</h4>
                                <p className="text-sm text-gray-500 mb-4">
                                    {isEditing ? "Upload new to replace existing" : "Upload background image for offer letters"}
                                </p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setOfferLetterFile(e.target.files[0])}
                                    className="hidden"
                                    id="offer-upload"
                                />
                                <label htmlFor="offer-upload">
                                    <Button type="button" variant="outline" size="sm" as="span">
                                        {offerLetterFile ? offerLetterFile.name : "Upload Image"}
                                    </Button>
                                </label>
                            </div>
                        )}

                        <div className="border border-dashed border-gray-300 p-6 rounded-lg text-center">
                            <Icons.Certificate className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                            <h4 className="font-medium text-gray-900">Certificate Template</h4>
                            <p className="text-sm text-gray-500 mb-4">
                                {isEditing ? "Upload new to replace existing" : "Upload background image for completion certificates"}
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setCertificateFile(e.target.files[0])}
                                className="hidden"
                                id="cert-upload"
                            />
                            <label htmlFor="cert-upload">
                                <Button type="button" variant="outline" size="sm" as="span">
                                    {certificateFile ? certificateFile.name : "Upload Image"}
                                </Button>
                            </label>
                        </div>
                    </div>
                )}

                {/* Step 4: Communication */}
                {currentStep === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <Input
                            label="WhatsApp Group Link"
                            {...register('whatsappGroupLink')}
                            placeholder="https://chat.whatsapp.com/..."
                        />
                        <TextArea
                            label="Welcome WhatsApp Message"
                            {...register('whatsappMessage')}
                            placeholder="Hello {{name}}, welcome..."
                            rows={3}
                        />
                        <div className="border-t border-gray-100 my-4 pt-4">
                            <h4 className="font-medium text-secondary mb-3">Email Template</h4>
                            <Input
                                label="Email Subject"
                                {...register('emailSubject')}
                            />
                            <TextArea
                                label="Email Body"
                                {...register('emailBody')}
                                placeholder="Dear {{name}}..."
                                rows={4}
                                className="mt-4"
                            />
                        </div>
                    </div>
                )}

                {/* Navigation Actions */}
                <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                    {currentStep > 0 && (
                        <Button type="button" variant="ghost" onClick={handleBack}>
                            Back
                        </Button>
                    )}

                    {currentStep < steps.length - 1 ? (
                        <Button type="button" onClick={handleNext}>
                            Next &rarr;
                        </Button>
                    ) : (
                        <Button type="submit" isLoading={isSubmitting}>
                            {isEditing ? 'Update Program' : 'Create Program'}
                        </Button>
                    )}
                </div>

            </form>
        </div>
    );
}
