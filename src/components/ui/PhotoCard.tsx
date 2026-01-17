'use client';

import { useStore } from '@/lib/store';
import { Photo } from '@/lib/types';
import Link from 'next/link';
import { Heart, Download, Share2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface PhotoCardProps {
    photo: Photo;
}

export function PhotoCard({ photo }: PhotoCardProps) {
    const { isLiked, likePhoto } = useStore();
    const liked = isLiked(photo.id);
    const [isHovered, setIsHovered] = useState(false);

    const handleDownload = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = photo.url;
        link.download = `photo-${photo.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        likePhoto(photo.id);
    };

    return (
        <div
            className="pin group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={`/pin/${photo.id}`}>
                <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-auto min-h-[150px] bg-gray-200"
                    loading="lazy"
                />

                <div className={cn("pin-overlay", isHovered ? "opacity-100" : "opacity-0")}>
                    <div className="flex justify-between items-start">
                        <span className="text-white text-xs font-bold drop-shadow-md truncate max-w-[70%]">
                            {photo.title}
                        </span>
                        <button className="bg-red-600 text-white rounded-full px-3 py-1 text-xs font-bold hover:bg-red-700 transition-colors">
                            Save
                        </button>
                    </div>

                    <div className="pin-actions">
                         <button
                            onClick={handleDownload}
                            className="bg-white/80 hover:bg-white text-black p-2 rounded-full transition-colors"
                         >
                            <Download size={16} strokeWidth={3} />
                        </button>
                        <button
                            onClick={handleLike}
                            className={cn(
                                "p-2 rounded-full transition-colors",
                                liked ? "bg-red-600 text-white" : "bg-white/80 hover:bg-white text-black"
                            )}
                        >
                            <Heart size={16} strokeWidth={3} fill={liked ? "currentColor" : "none"} />
                        </button>
                    </div>
                </div>
            </Link>
        </div>
    );
}
