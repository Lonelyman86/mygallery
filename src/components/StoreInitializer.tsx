'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';

export function StoreInitializer() {
    const initialized = useRef(false);
    const { initAuth, fetchData } = useStore();

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        console.log("Initializing App...");
        initAuth();
        fetchData();

    }, [initAuth, fetchData]);

    return null;
}
