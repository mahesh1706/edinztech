import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../ui/Input';
import Button from '../ui/Button';
import { Icons } from '../icons';

const templateSchema = z.object({
    name: z.string().min(3, 'Template name is required'),
    // File validation is tricky on client-side mocks, assuming string for now or skipping
    fontSize: z.string().optional(),
    textColor: z.string().optional(),
});

export default function CertificateForm({ onSubmit }) {
    const [previewImage, setPreviewImage] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            fontSize: '18px',
            textColor: '#000000'
        }
    });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFormSubmit = async (data) => {
        console.log("Certificate Template Data:", { ...data, image: previewImage });
        if (onSubmit) onSubmit({ ...data, image: previewImage });
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Col: Upload & Config */}
                <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-secondary text-lg">Template Configuration</h3>

                    <Input
                        label="Template Name"
                        {...register('name')}
                        placeholder="e.g. Standard Completion 2024"
                        error={errors.name?.message}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Details</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors relative">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <Icons.Download className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-900 font-medium">Click to upload background</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Font Size" {...register('fontSize')} />
                        <Input label="Text Color" type="color" {...register('textColor')} className="h-10 p-1" />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                        <p className="font-bold mb-2">Available Placeholders:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>{"{{name}}"} - Student Name</li>
                            <li>{"{{program}}"} - Program Title</li>
                            <li>{"{{date}}"} - Completion Date</li>
                            <li>{"{{id}}"} - Certificate ID</li>
                        </ul>
                    </div>
                </div>

                {/* Right Col: Preview */}
                <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 flex flex-col items-center justify-center min-h-[400px]">
                    <h3 className="font-bold text-gray-500 mb-4 h-10">Live Preview</h3>
                    <div className="relative w-full aspect-[1.414] bg-white shadow-lg rounded-lg overflow-hidden flex items-center justify-center">
                        {previewImage ? (
                            <img src={previewImage} alt="Certificate Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center text-gray-300">
                                <Icons.Award className="mx-auto h-16 w-16 mb-2" />
                                <p>No image uploaded</p>
                            </div>
                        )}

                        {/* Overlay Mock */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 pointer-events-none">
                            {previewImage && (
                                <>
                                    <h2 className="text-2xl font-serif font-bold text-gray-800 mb-1">CERTIFICATE</h2>
                                    <p className="text-sm text-gray-600 mb-4">OF COMPLETION</p>
                                    <p className="text-xl font-bold text-primary mb-2">John Doe</p>
                                    <p className="text-sm text-gray-600">For completing the course</p>
                                    <p className="text-lg font-bold text-gray-800 mb-6">Full Stack Development</p>
                                    <p className="text-xs text-gray-500">Dec 12, 2024</p>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="mt-6 flex gap-4 w-full">
                        <Button type="button" variant="outline" className="flex-1">Reset</Button>
                        <Button type="submit" isLoading={isSubmitting} className="flex-1">Save Template</Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
