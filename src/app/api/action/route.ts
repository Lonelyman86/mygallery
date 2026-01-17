import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';

// Helper to update JSON in GitHub (Generic)
async function updateDbJson(octokit: Octokit, owner: string, repo: string, actionType: string, payload: any) {
    try {
        const PATH = 'src/data/db.json';

        // 1. Get current db.json
        const { data: { content, sha } } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: PATH
        }) as any;

        const currentData = JSON.parse(Buffer.from(content, 'base64').toString());

        // 2. Apply Action logic
        switch (actionType) {
            case 'like': {
                // payload: { photoId, userId }
                const { photoId, userId } = payload;
                if (!currentData.likes) currentData.likes = {};
                const likes = currentData.likes[photoId] || [];
                if (likes.includes(userId)) {
                    // Unlike
                    currentData.likes[photoId] = likes.filter((id: string) => id !== userId);
                } else {
                    // Like
                    currentData.likes[photoId] = [...likes, userId];
                }
                break;
            }
            case 'follow': {
                // payload: { followerId, targetId }
                const { followerId, targetId } = payload;
                if (!currentData.following) currentData.following = {};
                const following = currentData.following[followerId] || [];
                if (following.includes(targetId)) {
                    // Unfollow
                    currentData.following[followerId] = following.filter((id: string) => id !== targetId);
                } else {
                    // Follow
                    currentData.following[followerId] = [...following, targetId];
                }
                break;
            }
            case 'save': {
                 // payload: { userId, photoId }
                 const { userId, photoId } = payload;
                 if (!currentData.saved) currentData.saved = {};
                 const saved = currentData.saved[userId] || [];
                 if (saved.includes(photoId)) {
                     // Unsave
                     currentData.saved[userId] = saved.filter((id: string) => id !== photoId);
                 } else {
                     // Save
                     currentData.saved[userId] = [...saved, photoId];
                 }
                 break;
            }
            case 'updateProfile': {
                // payload: { userId, data: { bio, ... } }
                const { userId, data } = payload;
                if (!currentData.users) currentData.users = [];
                const userIndex = currentData.users.findIndex((u: any) => u.id === userId);
                if (userIndex >= 0) {
                    currentData.users[userIndex] = { ...currentData.users[userIndex], ...data };
                } else {
                    // Create if not exists (edge case)
                    currentData.users.push({ id: userId, ...data });
                }
                break;
            }
            case 'comment': {
                 // payload: Comment object
                 if (!currentData.comments) currentData.comments = [];
                 currentData.comments.push(payload);
                 break;
            }
        }

        // 3. Commit
        const newContent = Buffer.from(JSON.stringify(currentData, null, 2)).toString('base64');

        await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: PATH,
            message: `chore: ${actionType} action by user`,
            content: newContent,
            sha,
            committer: {
                name: 'Galeriku Bot',
                email: 'bot@galeriku.app'
            }
        });

        return currentData;

    } catch (e) {
        console.error("DB Update Failed:", e);
        throw e;
    }
}

export async function POST(req: NextRequest) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) return NextResponse.json({ error: "Missing Token" }, { status: 500 });

    const OWNER = process.env.GITHUB_OWNER || 'IkhsanAlparizki';
    const REPO = process.env.GITHUB_REPO || 'Galeriku';

    const octokit = new Octokit({ auth: token });
    const { action, payload } = await req.json(); // { action: 'like', payload: {...} }

    try {
        const updateResult = await updateDbJson(octokit, OWNER, REPO, action, payload);
        return NextResponse.json({ success: true, data: updateResult });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
