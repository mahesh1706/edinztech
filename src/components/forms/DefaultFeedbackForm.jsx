import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../ui/Button'; // Fixed path
import { submitDefaultFeedback } from '../../lib/api'; // Also fix api import which is likely wrong too

const feedbackSchema = z.object({
    inspireId: z.string().min(1, "Inspire ID is required"),
    name: z.string().min(1, "Name is required"),
    organization: z.string().min(1, "Organization is required"),
    email: z.string().email("Invalid email"),
    mobile: z.string().min(10, "Valid mobile number required"),
    place: z.string().min(1, "Place is required"),
    state: z.string().min(1, "State is required"),
    feedback: z.string().min(10, "Please provide at least 10 characters of feedback")
});

export default function DefaultFeedbackForm({ program, onSuccess }) {
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(feedbackSchema)
    });

    const onSubmit = async (data) => {
        try {
            setSubmitting(true);
            await submitDefaultFeedback({
                programId: program._id,
                ...data
            });
            alert("Feedback submitted successfully!");
            onSuccess(); // Callback to refresh parent
        } catch (error) {
            console.error("Submission failed", error);
            alert(error.response?.data?.message || "Failed to submit feedback");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">We Value Your Feedback!</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <p className="text-xs text-red-500 mb-1">* Details given below will be taken for certificate generation!</p>
                    <input
                        {...register('inspireId')}
                        placeholder="Enter Inspire ID"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                    {errors.inspireId && <p className="text-xs text-red-500 mt-1">{errors.inspireId.message}</p>}
                </div>

                <div>
                    <p className="text-xs text-red-500 mb-1">* Below entered detail will be printed in the certificate!</p>
                    <input
                        {...register('name')}
                        placeholder="Enter Name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>

                <div>
                    <p className="text-xs text-red-500 mb-1">* Below entered detail will be printed in the certificate!</p>
                    <input
                        {...register('organization')}
                        placeholder="Enter Organization or Institution Name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                    {errors.organization && <p className="text-xs text-red-500 mt-1">{errors.organization.message}</p>}
                </div>

                <input
                    {...register('email')}
                    placeholder="Enter Email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}

                <input
                    {...register('mobile')}
                    placeholder="Enter Mobile Number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
                {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile.message}</p>}

                <input
                    {...register('place')}
                    placeholder="Enter Place"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
                {errors.place && <p className="text-xs text-red-500 mt-1">{errors.place.message}</p>}

                <input
                    {...register('state')}
                    placeholder="Enter State"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
                {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}

                <textarea
                    {...register('feedback')}
                    placeholder="Enter Your Feedback"
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                />
                {errors.feedback && <p className="text-xs text-red-500 mt-1">{errors.feedback.message}</p>}

                <Button type="submit" disabled={submitting} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg mt-4">
                    {submitting ? 'Submitting...' : 'Submit'}
                </Button>
            </form>
        </div>
    );
}
