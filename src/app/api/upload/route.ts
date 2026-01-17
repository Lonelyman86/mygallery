import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';

// Helper to update JSON in GitHub
async function updateDbJson(octokit: Octokit, owner: string, repo: string, newData: any) {
    try {
        // 1. Get current db.json
        const { data: { content, sha } } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: 'src/data/db.json'
        }) as any;

        // 2. Decode and parse
        const currentData = JSON.parse(Buffer.from(content, 'base64').toString());

        // 3. Append new data
        // For photos:
        if (newData.type === 'photo') {
            currentData.photos.unshift(newData.payload);
        } else if (newData.type === 'comment') {
            currentData.comments.push(newData.payload);
        }

        // 4. Encode and Commit
        const newContent = Buffer.from(JSON.stringify(currentData, null, 2)).toString('base64');

        await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: 'src/data/db.json',
            message: `chore: update db.json (${newData.type})`,
            content: newContent,
            sha,
            committer: {
                name: 'Galeriku Bot',
                email: 'bot@galeriku.app'
            }
        });

    } catch (e) {
        console.error("DB Update Failed:", e);
        throw e;
    }
}

export async function POST(req: NextRequest) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) return NextResponse.json({ error: "Server missing GITHUB_TOKEN" }, { status: 500 });

    // Hardcoded repo details for now (User should configure these)
    // We assume the Vercel/Netlify environment variables GITHUB_OWNER / GITHUB_REPO are set
    // Or we extract from remote origin? Use env vars for safety.
    const OWNER = process.env.GITHUB_OWNER || 'IkhsanAlparizki';
    const REPO = process.env.GITHUB_REPO || 'Galeriku';

    const octokit = new Octokit({ auth: token });
    const { image, title, description, userId } = await req.json(); // image is data:image/jpeg;base64,...

    // 1. Upload Image to public/uploads
    // image is "data:image/jpeg;base64,......."
    // valid split:
    const base64Data = image.split(',')[1];
    const extension = image.split(';')[0].split('/')[1] || 'jpg';
    const filename = `photo-${Date.now()}.${extension}`;
    const path = `public/uploads/${filename}`;

    try {
        await octokit.rest.repos.createOrUpdateFileContents({
            owner: OWNER,
            repo: REPO,
            path: path,
            message: `feat: upload new photo ${title}`,
            content: base64Data,
            committer: {
                name: 'Galeriku Bot',
                email: 'bot@galeriku.app'
            }
        });

        // 2. Update DB
        const photoEntry = {
            id: filename.replace('.', '-'),
            url: `/uploads/${filename}`, // Relative path accessible after build
            title,
            description,
            userId,
            createdAt: new Date().toISOString(),
            likes: 0
        };

        await updateDbJson(octokit, OWNER, REPO, { type: 'photo', payload: photoEntry });

        return NextResponse.json({ success: true, path: `/uploads/${filename}` });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
