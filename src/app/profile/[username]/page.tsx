'use client';

import { useStore } from '@/lib/store';
import { User, Photo } from '@/lib/types';
import { MasonryGrid } from '@/components/ui/MasonryGrid';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const { users, currentUser, photos, followUser, following } = useStore();
    const [profileUser, setProfileUser] = useState<User | undefined>(undefined);

    useEffect(() => {
        const found = users.find(u => u.username === username);
        // Fallback for demo user if not in store but in store initializer (it was added to store so should be fine)
        if (found) {
            setProfileUser(found);
        } else if (username === 'demo_user') {
            // Hotfix if seed didn't run properly before navigation or race condition
        }
    }, [users, username]);

    if (!profileUser) {
         return <div className="p-10 text-center">User not found</div>;
    }

    const createdPhotos = photos.filter(p => p.userId === profileUser.id);
    // Saved photos logic (liked)
    // In our store, likedPhotoIds is per photo.
    // We need to reverse it or store user's likes.
    // get().likedPhotoIds[photoId] returns user IDs.
    // Simpler: iterate all photos and check isLiked.

    // Actually, store has `likedPhotoIds` where keys are photoIds.
    // To find "photos liked by user", we traverse all keys.
    const { likedPhotoIds } = useStore.getState();
    // We can't access state directly inside render if we want reactivity without selector,
    // but useStore() gives us the state.
    // We used `isLiked` helper but that uses `currentUser`.
    // We want to see `profileUser`'s saved photos?
    // The requirement is usually "Saved" tab on profile.

    const savedPhotos = photos.filter(p => {
        const likers = likedPhotoIds[p.id] || [];
        return likers.includes(profileUser.id);
    });

    const isMe = currentUser?.id === profileUser.id;
    const isFollowing = currentUser && following[currentUser.id]?.includes(profileUser.id);

    return (
        <div className="flex flex-col items-center pt-8">
            {/* Header */}
            <div className="flex flex-col items-center mb-12">
                {profileUser.avatar ? (
                     <img src={profileUser.avatar} alt={profileUser.name} className="w-32 h-32 rounded-full object-cover mb-4" />
                ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-bold mb-4">
                        {profileUser.name.charAt(0)}
                    </div>
                )}

                <h1 className="text-3xl font-bold mb-1">{profileUser.name}</h1>
                <p className="text-gray-500 mb-2">@{profileUser.username}</p>
                {profileUser.bio && <p className="text-center max-w-md text-gray-700 mb-4">{profileUser.bio}</p>}

                <div className="flex gap-2 text-sm font-bold text-gray-700 mb-6">
                    <span>{following[profileUser.id]?.length || 0} following</span>
                    <span>•</span>
                    <span>10 followers</span> {/* Mocked followers count for now */}
                </div>

                <div className="flex gap-2">
                    <button className="bg-gray-100 px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition">
                        Share
                    </button>
                    {isMe ? (
                         <button className="bg-gray-100 px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition">
                            Edit Profile
                        </button>
                    ) : (
                        <button
                            onClick={() => currentUser && followUser(profileUser.id)}
                            className={`px-6 py-3 rounded-full font-bold transition text-white ${isFollowing ? 'bg-black' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="w-full max-w-5xl px-4">
                 <div className="flex justify-center gap-8 mb-8 font-bold border-b border-gray-200 pb-4">
                    <button className="text-black border-b-2 border-black -mb-4 pb-4">Created</button>
                    <button className="text-gray-500 hover:text-black transition">Saved</button>
                 </div>

                 {/* Content */}
                 <MasonryGrid photos={createdPhotos} />
            </div>
        </div>
    );
}
