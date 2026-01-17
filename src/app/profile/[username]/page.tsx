'use client';

import { useStore } from '@/lib/store';
import { User, Photo } from '@/lib/types';
import { MasonryGrid } from '@/components/ui/MasonryGrid';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const { users, currentUser, photos, followUser, following, saved, updateProfile } = useStore();
    const [profileUser, setProfileUser] = useState<User | undefined>(undefined);

    const [activeTab, setActiveTab] = useState<'created' | 'saved'>('created');
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editBio, setEditBio] = useState('');

    useEffect(() => {
        const found = users.find(u => u.username === username);
        if (found) {
            setProfileUser(found);
        }
    }, [users, username]);

    useEffect(() => {
        if (profileUser) {
            setEditName(profileUser.name);
            setEditBio(profileUser.bio || '');
        }
    }, [profileUser]);

    if (!profileUser) {
         return <div className="p-10 text-center">User not found</div>;
    }

    // Derived state
    const createdPhotos = photos.filter(p => p.userId === profileUser.id);

    // Saved photos logic using `saved` store
    const savedPhotoIds = saved[profileUser.id] || [];
    const savedPhotosList = photos.filter(p => savedPhotoIds.includes(p.id));

    const photosToDisplay = activeTab === 'created' ? createdPhotos : savedPhotosList;

    const followersCount = users.filter(u => following[u.id]?.includes(profileUser.id)).length;

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link profile copied to clipboard!');
    };

    const handleSaveProfile = async () => {
        if (!process.env.NEXT_PUBLIC_IS_DEMO && currentUser) {
             await updateProfile({ name: editName, bio: editBio });
             setIsEditing(false);
        } else {
            // Local fallback if env missing
             await updateProfile({ name: editName, bio: editBio });
             setIsEditing(false);
        }
    };



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

                {isEditing ? (
                    <div className="flex flex-col gap-2 mb-4 w-64">
                        <input
                            className="text-3xl font-bold text-center border-b border-gray-300 focus:outline-none focus:border-black"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                        />
                        <textarea
                            className="text-center text-gray-700 border-b border-gray-300 focus:outline-none focus:border-black resize-none"
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            placeholder="Add a bio"
                        />
                         <div className="flex gap-2 justify-center mt-2">
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 rounded-full font-bold text-sm">Cancel</button>
                            <button onClick={handleSaveProfile} className="px-4 py-2 bg-black text-white rounded-full font-bold text-sm">Save</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold mb-1">{profileUser.name}</h1>
                        <p className="text-gray-500 mb-2">@{profileUser.username}</p>
                        {profileUser.bio && <p className="text-center max-w-md text-gray-700 mb-4">{profileUser.bio}</p>}
                    </>
                )}

                <div className="flex gap-2 text-sm font-bold text-gray-700 mb-6">
                    <span>{following[profileUser.id]?.length || 0} following</span>
                    <span>•</span>
                    <span>{followersCount} followers</span>
                </div>

                <div className="flex gap-2">
                    <button onClick={handleShare} className="bg-gray-100 px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition">
                        Share
                    </button>
                    {isMe ? (
                         !isEditing && (
                            <button onClick={() => setIsEditing(true)} className="bg-gray-100 px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition">
                                Edit Profile
                            </button>
                         )
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
                    <button
                        onClick={() => setActiveTab('created')}
                        className={`pb-4 -mb-4 border-b-2 transition ${activeTab === 'created' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}
                    >
                        Created
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                         className={`pb-4 -mb-4 border-b-2 transition ${activeTab === 'saved' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}
                    >
                        Saved
                    </button>
                 </div>

                 {/* Content */}
                 {photosToDisplay.length > 0 ? (
                    <MasonryGrid photos={photosToDisplay} />
                 ) : (
                    <div className="text-center py-10 text-gray-500">
                        {activeTab === 'created' ? 'No photos yet.' : 'No saved photos yet.'}
                    </div>
                 )}
            </div>
        </div>
    );
}
