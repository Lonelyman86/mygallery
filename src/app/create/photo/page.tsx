'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Upload, X, Loader2 } from 'lucide-react';

export default function CreatePhoto() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const { uploadPhoto, currentUser, loading } = useStore();
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async () => {
        if (!file || !currentUser) return;

        await uploadPhoto(file, { title, description });
        // The store handles layout redirect or alert
        router.push('/');
    };

    // If loading
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="animate-spin text-red-600" size={48} />
                <h2 className="text-xl font-bold">Uploading to GitHub...</h2>
                <p className="text-gray-500 text-center max-w-md">this may take a few seconds. The site will rebuild shortly after to display your image.</p>
            </div>
        );
    }

    if (!currentUser) {
         return (
             <div className="p-20 text-center">
                 <p className="mb-4">You must be logged in to upload.</p>
             </div>
         );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-8">Create Pin</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* Upload Area */}
                <div className="bg-gray-100 rounded-3xl p-4 flex items-center justify-center min-h-[400px] relative border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
                    {preview ? (
                        <div className="relative w-full h-full">
                            <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-2xl" />
                            <button
                                onClick={() => { setFile(null); setPreview(null); }}
                                className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center cursor-pointer w-full h-full justify-center">
                            <div className="bg-gray-200 p-4 rounded-full mb-4">
                                <Upload size={24} className="text-gray-600" />
                            </div>
                            <p className="text-center font-medium">Choose a file or drag and drop it here</p>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    )}
                </div>

                {/* Fields */}
                <div className="space-y-6 lg:pt-8 content-center">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Title</label>
                        <input
                            type="text"
                            placeholder="Add a title"
                            className="w-full text-3xl font-bold placeholder-gray-400 border-none focus:ring-0 px-0 bg-transparent"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <div className="h-[1px] bg-gray-300 w-full mt-2"></div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Description</label>
                        <textarea
                            placeholder="Add a detailed description"
                            rows={3}
                            className="w-full text-base placeholder-gray-400 border-none focus:ring-0 px-0 bg-transparent resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                         <div className="h-[1px] bg-gray-300 w-full mt-2"></div>
                    </div>

                    <div className="flex justify-end pt-8">
                        <button
                            disabled={!file}
                            onClick={handleSubmit}
                            className="bg-red-600 text-white font-bold py-3 px-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition"
                        >
                            Save to Gallery
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
