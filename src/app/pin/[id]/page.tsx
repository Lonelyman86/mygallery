'use client';

import { useStore } from '@/lib/store';
import { Photo, Comment } from '@/lib/types';
import { MasonryGrid } from '@/components/ui/MasonryGrid';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Share2, Heart, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PinDetail() {
    const params = useParams();
    const id = params.id as string;
    const { photos, users, currentUser, comments, addComment, isLiked, likePhoto } = useStore();
    const [photo, setPhoto] = useState<Photo | undefined>(undefined);
    const [commentText, setCommentText] = useState('');
    const [pageMounted, setPageMounted] = useState(false);

    // Ensure hydration match
    useEffect(() => {
        setPageMounted(true);
        setPhoto(photos.find(p => p.id === id));
    }, [id, photos]);

    if (!pageMounted) return <div className="p-20 text-center"><span className="loader"></span></div>;
    if (!photo) return <div className="p-20 text-center">Photo not found.</div>;

    const author = users.find(u => u.id === photo.userId);
    const photoComments = comments.filter(c => c.photoId === photo.id);
    const liked = isLiked(photo.id);

    // Dynamic Save & Followers
    const { isSaved, savePhoto, following } = useStore();
    const savedPin = isSaved(photo.id);
    const followersCount = author ? users.filter(u => following[u.id]?.includes(author.id)).length : 0;

    // Related: same category (mocked) or random
    const relatedPhotos = photos.filter(p => p.id !== photo.id).slice(0, 8);

    const handleComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return alert("Please login to comment");
        if (!commentText.trim()) return;

        addComment(photo.id, commentText);
        setCommentText('');
    };

    const handleSave = () => {
        if (!currentUser) return alert("Please login to save");
        savePhoto(photo.id);
    };

    return (
        <div className="max-w-[1000px] mx-auto pt-8 px-4">
            <button onClick={() => window.history.back()} className="mb-4 text-sm font-bold hover:underline">
                &larr; Back
            </button>

            <div className="bg-white rounded-[32px] shadow-lg overflow-hidden flex flex-col md:flex-row mb-12">
                {/* Image Section */}
                <div className="w-full md:w-1/2 bg-gray-100">
                    <img src={photo.url} alt={photo.title} className="w-full h-full object-contain max-h-[80vh]" />
                </div>

                {/* Details Section */}
                <div className="w-full md:w-1/2 p-8 flex flex-col relative">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-4">
                            <button className="p-2 hover:bg-gray-100 rounded-full transition"><MoreHorizontal /></button>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition"><Share2 /></button>
                        </div>
                        <button
                            onClick={handleSave}
                            className={cn(
                                "text-white px-6 py-3 rounded-full font-bold transition",
                                savedPin ? "bg-black hover:bg-gray-800" : "bg-red-600 hover:bg-red-700"
                            )}>
                            {savedPin ? 'Saved' : 'Save'}
                        </button>
                    </div>

                    <h1 className="text-3xl font-bold mb-2">{photo.title}</h1>
                    <p className="text-gray-700 mb-6">{photo.description}</p>

                    {/* Author */}
                    {author && (
                        <div className="flex items-center gap-3 mb-6">
                            <Link href={`/profile/${author.username}`}>
                                {author.avatar ? <img src={author.avatar} className="w-10 h-10 rounded-full" /> :
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">{author.name.charAt(0)}</div>}
                            </Link>
                            <div className="flex flex-col">
                                <Link href={`/profile/${author.username}`} className="font-bold hover:underline">{author.name}</Link>
                                <span className="text-xs text-gray-500">{followersCount} followers</span>
                            </div>
                        </div>
                    )}

                    {/* Comments */}
                    <div className="flex-1 overflow-y-auto min-h-[150px] mb-6">
                        <h3 className="font-bold text-lg mb-4">Comments</h3>
                        {photoComments.length === 0 && <p className="text-gray-400 text-sm">No comments yet. Be the first to add one!</p>}
                        <div className="space-y-4">
                            {photoComments.map(c => {
                                const cAuthor = users.find(u => u.id === c.userId);
                                return (
                                    <div key={c.id} className="flex gap-2 items-start">
                                        <div className="w-8 h-8 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xs">
                                            {cAuthor?.name.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <span className="font-bold text-sm mr-2">{cAuthor?.name || 'Unknown'}</span>
                                            <span className="text-sm text-gray-700">{c.text}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="border-t border-gray-100 pt-6 bg-white sticky bottom-0">
                         <div className="flex justify-between items-center mb-4">
                             <div className="font-bold text-xl">{users.find(u => u.id === photo.userId)?.username}'s Pin</div>
                             <div className="flex gap-2">
                                <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full" onClick={() => likePhoto(photo.id)}>
                                    <Heart fill={liked ? "red" : "none"} stroke={liked ? "red" : "black"} />
                                </button>
                             </div>
                         </div>

                         {/* Add Comment */}
                         <form onSubmit={handleComment} className="flex gap-2 items-center">
                            {currentUser ? (
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center font-bold">
                                    {currentUser.name.charAt(0)}
                                </div>
                            ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                            )}
                             <input
                                type="text"
                                placeholder="Add a comment"
                                className="flex-1 bg-gray-100 rounded-full px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-gray-200 transition"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                             />
                         </form>
                    </div>

                </div>
            </div>

            <h2 className="text-center font-bold text-xl mb-6">More like this</h2>
            <MasonryGrid photos={relatedPhotos} />
        </div>
    );
}
