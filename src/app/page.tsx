'use client';

import { MasonryGrid } from "@/components/ui/MasonryGrid";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";

export default function Home() {
  const { photos } = useStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch for local storage data
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
      return (
          <div className="flex justify-center p-20">
              <div className="loader"></div>
          </div>
      );
  }

  return (
    <div className="pb-20 lg:pb-0">
        <MasonryGrid photos={photos} />
    </div>
  );
}
