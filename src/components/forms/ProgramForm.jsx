import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input, TextArea } from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Icons } from '../icons';
import { createProgram, uploadProgramTemplate } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

// Helper Component for Template Upload
const TemplateUploader = ({ label, file, setFile, initialUrl, onRemove }) => {
    const [preview, setPreview] = useState(null);

    // Effect to generate preview URL
    useEffect(() => {
        console.log(`[TemplateUploader] ${label} - initialUrl:`, initialUrl);
        console.log(`[TemplateUploader] ${label} - file:`, file);

        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (initialUrl && typeof initialUrl === 'string') {
            // Convert backend path (e.g., 'uploads/template-123.jpg') to accessible URL
            let url = initialUrl.replace(/\\/g, '/');
            if (!url.startsWith('/')) {
                url = '/' + url;
            }
            // Now url is like '/uploads/template-123.jpg'
            console.log(`[TemplateUploader] ${label} - processed url:`, url);
            setPreview(url);
        } else {
            setPreview(null);
        }
    }, [file, initialUrl, label]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleRemove = () => {
        setFile(null);
        if (onRemove) onRemove();
    };

    // If we have a preview (either new file or existing), show it
    if (preview) {
        return (
            <div className="border border-gray-200 p-4 rounded-lg text-center relative bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-2">{label}</h4>
                <div className="relative inline-block group">
                    <img
                        src={preview}
                        alt={`${label} Preview`}
                        className="h-48 object-contain rounded-md border border-gray-300 bg-white"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                        title="Remove Image"
                    >
                        <Icons.Close size={16} />
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    {file ? file.name : 'Current Template'}
                </p>
            </div>
        );
    }

    // Default Upload State
    return (
        <div className="border border-dashed border-gray-300 p-6 rounded-lg text-center hover:bg-gray-50 transition-colors">
            <Icons.Certificate className="mx-auto h-10 w-10 text-gray-300 mb-2" />
            <h4 className="font-medium text-gray-900">{label}</h4>
            <p className="text-sm text-gray-500 mb-4">
                Upload background image (JPG, PNG)
            </p>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            />
            <label htmlFor={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`}>
                <span className="inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-3 py-1.5 text-sm cursor-pointer shadow-sm">
                    Upload Image
                </span>
            </label>
        </div>
    );
};

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
    fee: z.union([z.string(), z.number()]).transform(val => String(val || '')).optional(),
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

export default function ProgramForm({ defaultValues: initialValues, onSubmit: parentSubmit, isEditing = false, programId }) {
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
            isValid = await trigger(['paymentMode', 'fee']);
            // Manual check for Paid mode safety:
            if (isValid && paymentMode === 'Paid') {
                if (!getValues('fee')) {
                    await trigger('fee');
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
            // IF PARENT SUBMIT PROVIDED (Edit Mode or Custom Handler)
            if (parentSubmit) {
                // Handle Uploads for Edit Mode
                if (isEditing && programId) {
                    if (offerLetterFile) {
                        try {
                            const uploadRes = await uploadProgramTemplate(programId, offerLetterFile);
                            if (uploadRes.path) {
                                payload.offerLetterTemplate = uploadRes.path;
                            }
                        } catch (err) {
                            console.error("Failed to upload offer letter", err);
                            // Optional: Alert user but continue? Or throw?
                        }
                    }
                    if (certificateFile) {
                        try {
                            const uploadRes = await uploadProgramTemplate(programId, certificateFile);
                            if (uploadRes.path) {
                                payload.certificateTemplate = uploadRes.path;
                            }
                        } catch (err) {
                            console.error("Failed to upload certificate", err);
                        }
                    }
                }

                await parentSubmit(payload);
                return;
            }

            // --- DEFAULT CREATE LOGIC ---

            // 2. Create Program
            const response = await createProgram(payload); // Expects { success: true, program: {...} } or just program
            const newProgramId = response._id || response.program?._id;

            if (!newProgramId) throw new Error("Failed to get Program ID");

            // 3. Upload Templates & Update Program
            const updates = {};

            if (offerLetterFile) {
                const uploadRes = await uploadProgramTemplate(newProgramId, offerLetterFile);
                if (uploadRes.path) {
                    updates.offerLetterTemplate = uploadRes.path;
                }
            }
            if (certificateFile) {
                const uploadRes = await uploadProgramTemplate(newProgramId, certificateFile);
                if (uploadRes.path) {
                    updates.certificateTemplate = uploadRes.path;
                }
            }

            // If we have template updates, save them
            if (Object.keys(updates).length > 0) {
                // We need to import updateProgram at the top
                const { updateProgram } = await import('../../lib/api');
                await updateProgram(newProgramId, updates);
            }

            // 4. Redirect
            navigate('/admin/programs');
        } catch (error) {
            console.error("Submission Error:", error);
            alert("Failed to save program: " + (error.response?.data?.message || error.message));
        }
    };

    // Auto-generate Program Code if missing
    const currentCode = watch('code');
    useEffect(() => {
        if (programType && !currentCode) {
            const date = new Date();
            const typeCode = programType.toUpperCase().slice(0, 3);
            const uniqueNum = Math.floor(100 + Math.random() * 900); // Random 3-digit number
            const code = `EDZ-${date.getFullYear()}-${typeCode}-${uniqueNum}`;
            setValue('code', code, { shouldDirty: true, shouldTouch: true });
        }
    }, [programType, currentCode, setValue]);

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
                                onClick={() => {
                                    if (index < currentStep || isEditing) {
                                        setCurrentStep(index);
                                    }
                                }}
                                className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                                    ${(index < currentStep || isEditing) ? 'cursor-pointer hover:text-gray-700' : 'cursor-default'}
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
                                    />
                                )}
                            />
                            <Input
                                label="Program Code"
                                {...register('code')}
                                value={watch('code') || ''}
                                disabled
                                className="bg-gray-50 bg-opacity-50 text-gray-500 cursor-not-allowed"
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
                                <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm flex items-start gap-2">
                                    <Icons.Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Automatic Payment Processing</p>
                                        <p className="mt-1 text-blue-600">
                                            Payments are processed automatically via Razorpay during checkout.
                                            No manual payment links are required.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                        {errors.fee && <p className="text-danger text-sm">{errors.fee.message}</p>}
                    </div>
                )}

                {/* Step 3: Templates */}
                {currentStep === 2 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        {programType === 'Internship' && (
                            <TemplateUploader
                                label="Offer Letter Template"
                                file={offerLetterFile}
                                setFile={setOfferLetterFile}
                                initialUrl={initialValues?.offerLetterTemplate}
                                onRemove={() => {
                                    setOfferLetterFile(null);
                                    // If needed, we could signal parent to clear exisiting, but state reset handles UI
                                }}
                            />
                        )}

                        <TemplateUploader
                            label="Certificate Template"
                            file={certificateFile}
                            setFile={setCertificateFile}
                            initialUrl={initialValues?.certificateTemplate}
                            onRemove={() => setCertificateFile(null)}
                        />
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
