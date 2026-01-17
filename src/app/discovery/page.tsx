'use client';

import { useStore } from '@/lib/store';
import { MasonryGrid } from '@/components/ui/MasonryGrid';

export default function DiscoveryPage() {
    const { photos } = useStore();
    // Discovery logic: Randomize or show trending. For now, just show all in random order?
    // Let's just reverse them to distinguish from Home.
    const discoveryPhotos = [...photos].reverse();

    return (
        <div className="flex flex-col items-center pt-8">
            <h1 className="text-2xl font-bold mb-8">Discover Inspiration</h1>
            <MasonryGrid photos={discoveryPhotos} />
        </div>
    );
}
