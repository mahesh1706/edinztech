import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Button from '../ui/Button';
import { Icons } from '../icons';

const questionSchema = z.object({
    id: z.string(),
    type: z.enum(['rating', 'single-select', 'multi-select', 'text']),
    text: z.string().min(1, 'Question text is required'),
    required: z.boolean(),
    options: z.array(z.string()).optional()
});

const feedbackSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    programId: z.string().min(1, 'Program is required'),
    startAt: z.string().optional().or(z.literal('')),
    endAt: z.string().optional().or(z.literal('')),
    questions: z.array(questionSchema).min(1, 'At least one question is required')
});

export default function FeedbackForm({ programs, onSubmit, defaultValues, isEditing }) {
    const { register, control, handleSubmit, watch, formState: { errors, isSubmitting }, setValue } = useForm({
        resolver: zodResolver(feedbackSchema),
        defaultValues: defaultValues || {
            title: '',
            description: '',
            programId: '',
            questions: [
                { id: crypto.randomUUID(), type: 'rating', text: 'How would you rate this program?', required: true, options: [] }
            ]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "questions"
    });

    const watchedQuestions = watch("questions");

    // Handle date formatting for inputs (YYYY-MM-DD)
    useEffect(() => {
        if (defaultValues?.startAt) {
            setValue('startAt', new Date(defaultValues.startAt).toISOString().split('T')[0]);
        }
        if (defaultValues?.endAt) {
            setValue('endAt', new Date(defaultValues.endAt).toISOString().split('T')[0]);
        }
    }, [defaultValues, setValue]);

    const addQuestion = () => {
        append({ id: crypto.randomUUID(), type: 'text', text: '', required: true, options: [] });
    };

    const addOption = (index, currentOptions) => {
        const newOptions = [...(currentOptions || []), `Option ${(currentOptions?.length || 0) + 1}`];
        setValue(`questions.${index}.options`, newOptions);
    };

    const removeOption = (qIndex, oIndex, currentOptions) => {
        const newOptions = currentOptions.filter((_, i) => i !== oIndex);
        setValue(`questions.${qIndex}.options`, newOptions);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Survey Title</label>
                    <input
                        {...register('title')}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g. End of Program Survey"
                    />
                    {errors.title && <p className="text-sm text-danger">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Program</label>
                    <select
                        {...register('programId')}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        disabled={isEditing} // Program shouldn't change generally, keeps ID stable
                    >
                        <option value="">Select a Program</option>
                        {programs.map(p => (
                            <option key={p._id} value={p._id}>{p.title}</option>
                        ))}
                    </select>
                    {errors.programId && <p className="text-sm text-danger">{errors.programId.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        {...register('description')}
                        rows="2"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Brief description of the survey..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Start Date (Optional)</label>
                    <input
                        type="date"
                        {...register('startAt')}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">End Date (Optional)</label>
                    <input
                        type="date"
                        {...register('endAt')}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Questions</h3>
                    <Button type="button" onClick={addQuestion} variant="outline" className="text-sm">
                        <Icons.Plus size={16} className="mr-2" /> Add Question
                    </Button>
                </div>

                <div className="space-y-6">
                    {fields.map((field, index) => {
                        const currentType = watchedQuestions[index]?.type;
                        const currentOptions = watchedQuestions[index]?.options;

                        return (
                            <div key={field.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Icons.Trash size={18} />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                                    <div className="md:col-span-8">
                                        <input
                                            {...register(`questions.${index}.text`)}
                                            placeholder="Question Text"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none"
                                        />
                                        {errors.questions?.[index]?.text && (
                                            <p className="text-xs text-danger mt-1">{errors.questions[index].text.message}</p>
                                        )}
                                    </div>
                                    <div className="md:col-span-3">
                                        <select
                                            {...register(`questions.${index}.type`)}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none"
                                        >
                                            <option value="rating">Rating (1-5)</option>
                                            <option value="text">Text Answer</option>
                                            <option value="single-select">Single Choice</option>
                                            <option value="multi-select">Multiple Choice</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-1 flex items-center justify-center">
                                        <label className="flex items-center gap-2 cursor-pointer" title="Required">
                                            <input type="checkbox" {...register(`questions.${index}.required`)} className="w-4 h-4 text-primary" />
                                            <span className="text-xs text-gray-500 md:hidden">Required</span>
                                        </label>
                                    </div>
                                </div>

                                {(currentType === 'single-select' || currentType === 'multi-select') && (
                                    <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Options</p>
                                        {currentOptions?.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-2">
                                                <Icons.Dot size={18} className="text-gray-300" />
                                                <input
                                                    value={opt}
                                                    onChange={(e) => {
                                                        const newOpts = [...currentOptions];
                                                        newOpts[oIndex] = e.target.value;
                                                        setValue(`questions.${index}.options`, newOpts);
                                                    }}
                                                    className="flex-1 px-2 py-1 text-sm bg-white border border-gray-200 rounded focus:border-primary focus:outline-none"
                                                />
                                                <button type="button" onClick={() => removeOption(index, oIndex, currentOptions)} className="text-gray-400 hover:text-danger">
                                                    <Icons.Close size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addOption(index, currentOptions)}
                                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
                                        >
                                            <Icons.Plus size={12} /> Add Option
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                {errors.questions && <p className="text-sm text-danger mt-4 text-center">{errors.questions.message}</p>}
            </div>

            <div className="flex justify-end pt-6">
                <Button type="submit" isLoading={isSubmitting}>
                    {isEditing ? 'Update Feedback' : 'Create Feedback'}
                </Button>
            </div>
        </form>
    );
}
