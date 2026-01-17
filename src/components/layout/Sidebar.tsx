'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Plus, User, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

export function Sidebar() {
    const pathname = usePathname();
    const { currentUser } = useStore();

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Compass, label: 'Discovery', href: '/discovery' },
        { icon: Plus, label: 'Create', href: '/create/photo' },
        { icon: Heart, label: 'Liked', href: '/liked' },
        {
            icon: User,
            label: 'Profile',
            href: currentUser ? `/profile/${currentUser.username}` : '/sign-in'
        },
    ];

    return (
        <aside className="sidenav z-50">
            <div className="mb-8">
                <Link href="/" className="flex items-center justify-center w-10 h-10 bg-red-600 text-white rounded-full font-bold text-xl">
                    G
                </Link>
            </div>

            <nav className="flex flex-col gap-6 items-center w-full">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "p-3 rounded-xl transition-all duration-200 group relative",
                                isActive ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100"
                            )}
                            title={item.label}
                        >
                            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            {/* Tooltip on hover */}
                            <span className="absolute left-14 top-1/2 -translate-y-1/2 w-auto p-2 min-w-max text-xs font-bold text-white bg-black rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
