import { NextResponse } from 'next/server';
import db from '@/data/db.json';

// Since this is built statically, we might need to read the file specifically/dynamically in Node
// But simply importing json in Next.js usually bakes it in at build time.
// Netlify Functions (API Routes) are server-side, they 'should' be able to read the *deployed* file?
// Actually, in Serverless, the filesystem is ephemeral.
// OPTION 1: Import directly. If we redeploy, the lambda updates? Yes.
// OPTION 2: Fetch from raw.githubusercontent? (Ensures freshness!)
// Let's use Option 2 to avoid "Stale Data" after a commit but before full rebuild propagation?
// No, the rebuild propagation is what we rely on for the image to exist.
// So reading the local json is consistent with the available images.

export async function GET() {
    // Return the JSON data
    // We explicitly read it?
    // Using simple import 'db' will use the version at BUILD time.
    // Which is correct for ISR/Static site paradigm.
    return NextResponse.json(db);
}
