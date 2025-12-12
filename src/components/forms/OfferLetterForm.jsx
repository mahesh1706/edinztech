import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../ui/Input';
import Button from '../ui/Button';
import { Icons } from '../icons';

const templateSchema = z.object({
    name: z.string().min(3, 'Template name is required'),
});

export default function OfferLetterForm({ onSubmit }) {
    const [previewImage, setPreviewImage] = useState(null);
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(templateSchema)
    });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <form onSubmit={handleSubmit(data => onSubmit && onSubmit({ ...data, previewImage }))} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-secondary text-lg">Offer Letter Config</h3>
                <Input label="Template Name" {...register('name')} placeholder="Summer Internship 2024" error={errors.name?.message} />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Letterhead Image</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center relative">
                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageUpload} />
                        <Icons.Briefcase className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-primary">Upload Letterhead</span>
                    </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg text-sm text-orange-800">
                    <p className="font-bold mb-2">Placeholders:</p>
                    <ul className="grid grid-cols-2 gap-1 text-xs">
                        <li>{"{{name}}"}</li>
                        <li>{"{{role}}"}</li>
                        <li>{"{{startDate}}"}</li>
                        <li>{"{{stipend}}"}</li>
                    </ul>
                </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-500 mb-4">Preview</h3>
                <div className="bg-white shadow-md w-full aspect-[1/1.414] p-8 relative overflow-hidden">
                    {previewImage && <img src={previewImage} className="absolute inset-0 w-full h-full object-cover opacity-20" />}
                    <div className="relative z-10 space-y-4 text-xs">
                        <h1 className="text-xl font-bold text-center mb-8">OFFER LETTER</h1>
                        <p>Dear <strong>John Doe</strong>,</p>
                        <p>We are pleased to offer you the position of <strong>Frontend Intern</strong>.</p>
                        <p>Start Date: <strong>Jan 15, 2024</strong></p>
                    </div>
                </div>
                <Button className="w-full mt-4">Save Template</Button>
            </div>
        </form>
    );
}
