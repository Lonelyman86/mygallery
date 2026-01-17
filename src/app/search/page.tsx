'use client';

import { useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { MasonryGrid } from '@/components/ui/MasonryGrid';
import { Suspense } from 'react';

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q')?.toLowerCase() || '';
    const { photos } = useStore();

    const filtered = photos.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );

    return (
        <div className="flex flex-col items-center pt-8">
            <h1 className="text-2xl font-bold mb-8 capitalize">{query ? `Results for "${query}"` : 'Explore'}</h1>
            <MasonryGrid photos={filtered} />
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center">Loading...</div>}>
            <SearchResults />
        </Suspense>
    );
}
