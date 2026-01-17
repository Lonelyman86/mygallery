'use client';

import Link from 'next/link';
import { Search, Bell } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import netlifyIdentity from 'netlify-identity-widget';

export function TopNav() {
    const { currentUser, logout } = useStore();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const openLogin = () => {
        netlifyIdentity.open('login');
    };

    const openSignup = () => {
        netlifyIdentity.open('signup');
    };

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between gap-4 border-b border-transparent">
            {/* Mobile Logo */}
            <div className="lg:hidden">
                <Link href="/" className="flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full font-bold">
                    G
                </Link>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white border-2 border-transparent focus:border-blue-500 rounded-full py-2.5 pl-10 pr-4 outline-none transition-all placeholder:text-gray-500 text-sm font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </form>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
                    <Bell size={24} />
                    {/* Badge could be conditional */}
                </button>

                {currentUser ? (
                    <div className="flex items-center gap-2">
                        <Link href={`/profile/${currentUser.username}`}>
                            {currentUser.avatar ? (
                                <img src={currentUser.avatar} alt="Me" className="w-8 h-8 rounded-full border border-gray-200" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs">
                                    {currentUser.name.charAt(0)}
                                </div>
                            )}
                        </Link>
                        <button
                            onClick={() => { logout(); router.push('/'); }}
                            className="bg-gray-100 hover:bg-gray-200 text-xs font-bold px-3 py-2 rounded-full transition-colors hidden sm:block"
                        >
                            Log Out
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                         <button onClick={openLogin} className="bg-red-600 text-white  px-4 py-2 rounded-full font-bold text-sm hover:bg-red-700 transition-colors">
                            Log in
                        </button>
                        <button onClick={openSignup} className="bg-gray-100 text-black px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors hidden sm:block">
                            Sign up
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
