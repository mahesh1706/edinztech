import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../ui/Input';
import Button from '../ui/Button';
import { Icons } from '../icons';
import { createQuiz, updateQuiz, uploadQuizImage } from '../../lib/api';

const questionSchema = z.object({
    question: z.string().min(1, 'Question text is required'),
    type: z.enum(['mcq', 'text']),
    image: z.string().optional(),
    marks: z.coerce.number().min(1),
    // Options required only if type is mcq
    options: z.array(z.string()).optional(),
    correctOption: z.coerce.number().optional(),
    correctAnswer: z.string().optional()
}).refine(data => {
    if (data.type === 'mcq') {
        if (!data.options || data.options.length < 2) return false;
        if (data.correctOption === undefined || data.correctOption === null) return false;
    }
    return true;
}, {
    message: "MCQ must have at least 2 options and a correct answer",
    path: ["options"]
});

const quizSchema = z.object({
    title: z.string().min(3, 'Title is required'),
    description: z.string().optional(),
    programId: z.string().min(1, 'Program is required'),
    passingScore: z.coerce.number().min(1).max(100),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    questions: z.array(questionSchema).min(1, 'At least one question is required'),
});

export default function QuizForm({ programId, programs, defaultValues, onSubmit, isEditing }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingQIndex, setUploadingQIndex] = useState(null);

    const { register, control, handleSubmit, formState: { errors }, setValue, watch, getValues } = useForm({
        resolver: zodResolver(quizSchema),
        defaultValues: defaultValues ? {
            ...defaultValues,
            programId: programId || defaultValues.program,
            startTime: defaultValues.startTime ? new Date(defaultValues.startTime).toISOString().slice(0, 16) : '',
            endTime: defaultValues.endTime ? new Date(defaultValues.endTime).toISOString().slice(0, 16) : '',
            questions: defaultValues.questions.map(q => ({
                ...q,
                type: q.type || 'mcq',
                marks: q.marks || 1,
                image: q.image || '',
                correctAnswer: q.correctAnswer || ''
            }))
        } : {
            title: '',
            description: '',
            programId: programId || '',
            passingScore: 60,
            questions: [{ question: '', type: 'mcq', marks: 1, options: ['', '', '', ''], correctOption: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "questions"
    });

    const handleFormSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                // Ensure programId is from data (selected) or prop
                programId: data.programId,
                // Ensure dates are sent correctly or null if empty
                startTime: data.startTime || null,
                endTime: data.endTime || null,
            };

            if (isEditing) {
                await updateQuiz(defaultValues._id || defaultValues.id, payload);
            } else {
                await createQuiz(payload);
            }
            onSubmit();
        } catch (error) {
            console.error("Quiz save error", error);
            alert("Failed to save quiz: " + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                <div className="md:col-span-2">
                    <Input label="Quiz Title" {...register('title')} error={errors.title?.message} placeholder="e.g., React Fundamentals" />
                </div>

                {/* Program Selection Check */}
                {programs && programs.length > 0 && !programId && (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                        <select
                            {...register('programId')}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                        >
                            <option value="">Select a Program</option>
                            {programs.map(p => (
                                <option key={p._id || p.id} value={p._id || p.id}>{p.title}</option>
                            ))}
                        </select>
                        {errors.programId && <p className="text-red-500 text-sm mt-1">{errors.programId.message}</p>}
                    </div>
                )}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        {...register('description')}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                        rows={3}
                    />
                </div>
                <div>
                    <Input
                        label="Passing Score (%)"
                        type="number"
                        {...register('passingScore')}
                        error={errors.passingScore?.message}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Start Time"
                        type="datetime-local"
                        {...register('startTime')}
                    />
                    <Input
                        label="End Time"
                        type="datetime-local"
                        {...register('endTime')}
                    />
                </div>
            </div>

            {/* Questions Builder */}
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="text-lg font-bold text-secondary">Questions ({fields.length})</h4>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ question: '', type: 'mcq', marks: 1, options: ['', '', '', ''], correctOption: 0 })}>
                        <Icons.Plus size={16} className="mr-1" /> Add Question
                    </Button>
                </div>

                {errors.questions && <p className="text-red-500 text-sm">{errors.questions.message}</p>}

                {fields.map((field, index) => {
                    // Watch field values for conditional rendering
                    const currentType = watch(`questions.${index}.type`);
                    const currentImage = watch(`questions.${index}.image`);

                    const handleImageUpload = async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        setUploadingQIndex(index);
                        try {
                            const res = await uploadQuizImage(file);
                            setValue(`questions.${index}.image`, res.url);
                        } catch (err) {
                            alert("Upload failed");
                        } finally {
                            setUploadingQIndex(null);
                        }
                    };

                    return (
                        <div key={field.id} className="bg-white border rounded-lg p-6 shadow-sm relative group">
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                            >
                                <Icons.Trash size={18} />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                                <div className="md:col-span-8">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Question {index + 1}</label>
                                    <Input
                                        {...register(`questions.${index}.question`)}
                                        placeholder="Enter question text..."
                                        error={errors.questions?.[index]?.question?.message}
                                    />

                                    {/* Image Upload Area */}
                                    <div className="mt-2">
                                        {currentImage ? (
                                            <div className="relative inline-block mt-2">
                                                <img src={currentImage} alt="Question" className="h-32 rounded border" />
                                                <button
                                                    type='button'
                                                    onClick={() => setValue(`questions.${index}.image`, '')}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    <Icons.X size={12} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="mt-2">
                                                <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                                    <Icons.Upload size={16} className="mr-2" />
                                                    {uploadingQIndex === index ? 'Uploading...' : 'Upload Image'}
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        {...register(`questions.${index}.type`)}
                                        className="w-full px-3 py-2 border rounded-lg outline-none bg-white"
                                    >
                                        <option value="mcq">MCQ</option>
                                        <option value="text">Paragraph</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                                    <Input
                                        type="number"
                                        {...register(`questions.${index}.marks`)}
                                        error={errors.questions?.[index]?.marks?.message}
                                    />
                                </div>
                            </div>

                            {currentType === 'mcq' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[0, 1, 2, 3].map((optIndex) => (
                                        <div key={optIndex} className="flex items-center gap-2">
                                            <div className="pt-2">
                                                <input
                                                    type="radio"
                                                    value={optIndex}
                                                    {...register(`questions.${index}.correctOption`)}
                                                    className="w-4 h-4 text-primary focus:ring-primary"
                                                />
                                            </div>
                                            <div className="flex-grow">
                                                <Input
                                                    placeholder={`Option ${optIndex + 1}`}
                                                    {...register(`questions.${index}.options.${optIndex}`)}
                                                    error={errors.questions?.[index]?.options?.[optIndex]?.message}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference Answer (For Grading)</label>
                                    <textarea
                                        {...register(`questions.${index}.correctAnswer`)}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        rows={3}
                                        placeholder="Enter the expected answer or keywords for the evaluator..."
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end pt-6 border-t">
                <Button type="submit" isLoading={isSubmitting} size="lg">
                    {isEditing ? 'Update Quiz' : 'Create Quiz'}
                </Button>
            </div>
        </form>
    );
}
