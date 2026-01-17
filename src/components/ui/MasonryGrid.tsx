'use client';

import { Photo } from "@/lib/types";
import { PhotoCard } from "./PhotoCard";

interface MasonryGridProps {
    photos: Photo[];
}

export function MasonryGrid({ photos }: MasonryGridProps) {
    if (photos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-xl font-bold text-gray-500 mb-2">It's a bit empty here.</p>
                <p className="text-gray-400">Upload some photos to get started!</p>
            </div>
        );
    }

    return (
        <div className="masonry">
            {photos.map((photo) => (
                <PhotoCard key={photo.id} photo={photo} />
            ))}
        </div>
    );
}
