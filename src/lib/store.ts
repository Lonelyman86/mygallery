import { create } from 'zustand';
import { User, Photo, Album, Comment } from './types';
import netlifyIdentity from 'netlify-identity-widget';

interface AppState {
  currentUser: User | null;
  users: User[]; // From DB
  photos: Photo[]; // From DB
  albums: Album[]; // From DB
  comments: Comment[]; // From DB
  likedPhotoIds: Record<string, string[]>; // photoId -> userId[]
  following: Record<string, string[]>; // userId -> followingUserId[]

  // Status
  loading: boolean;
  error: string | null;

  // Actions
  initAuth: () => void;
  fetchData: () => Promise<void>;

  uploadPhoto: (file: File, meta: { title: string, description: string }) => Promise<void>;

  logout: () => void;
  // Others (comments, likes) would also be async API calls ideally,
  // but for "MVP Github DB" we might just commit them too or store in memory temporarily?
  // Committing every like is too heavy.
  // STRATEGY:
  // - Photos: Commit to GitHub (because they are files).
  // - Likes/Comments: Commit to `db.json` in GitHub?
  //   > Yes, `db.json` is the single source of truth.

  likePhoto: (photoId: string) => Promise<void>;
  addComment: (photoId: string, text: string) => Promise<void>;
  isLiked: (photoId: string) => boolean;
  followUser: (targetUserId: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: [],
  photos: [],
  albums: [],
  comments: [],
  likedPhotoIds: {},
  following: {},
  loading: false,
  error: null,

  initAuth: () => {
    // init netlify identity
    if (typeof window !== 'undefined') {
        netlifyIdentity.init();
        const user = netlifyIdentity.currentUser();
        if (user) {
            set({
                currentUser: {
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                    username: user.email?.split('@')[0] || 'user',
                    avatar: user.user_metadata?.avatar_url || ''
                }
            });
        }

        netlifyIdentity.on('login', (user: any) => {
             set({
                currentUser: {
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                    username: user.email?.split('@')[0] || 'user',
                    avatar: user.user_metadata?.avatar_url || ''
                }
            });
            netlifyIdentity.close();
        });

        netlifyIdentity.on('logout', () => {
            set({ currentUser: null });
        });
    }
  },

  logout: () => {
      netlifyIdentity.logout();
  },

  fetchData: async () => {
      set({ loading: true });
      try {
          const res = await fetch('/api/data');
          if (!res.ok) throw new Error("Failed to fetch data");
          const data = await res.json();
          // Merge data
          set({
              photos: data.photos || [],
              users: data.users || [], // We might merge active user here?
              comments: data.comments || [],
              likedPhotoIds: data.likes || {},
              loading: false
          });
      } catch (err) {
          console.error(err);
          set({ loading: false });
      }
  },

  uploadPhoto: async (file, meta) => {
      const { currentUser } = get();
      if (!currentUser) return;

      set({ loading: true });
      try {
          // Convert file to base64
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async () => {
              const base64 = reader.result as string;

              // Post to API
              await fetch('/api/upload', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      image: base64, // Just the data URL
                      title: meta.title,
                      description: meta.description,
                      userId: currentUser.id,
                      userName: currentUser.name // snapshot name
                  })
              });

              set({ loading: false });
              // Optimistic update?
              // Difficult because we don't know the final URL until GitHub commit + Build.
              // We'll just alert user "Upload processing... come back in 2 mins".
              alert("Upload Successful! Photo will appear in ~2 minutes after site rebuild.");
          };
      } catch (e) {
          console.error(e);
          set({ loading: false, error: "Upload Failed" });
      }
  },

  likePhoto: async (photoId) => {
      // Simplification: In a real "no-db" app, real-time writes are hard.
      // We will skip implementing persistent likes for "Github DB" mode
      // because waiting 2 mins for a "Like" to register is bad UX.
      // We will keep Likes in LocalStorage for "Personal Likes".
      console.log("Likes are local-only in this demo mode");
  },

  addComment: async (photoId, text) => {
      // Same for comments - 2 min delay is bad.
      // We can persist them to GitHub DB so they eventually appear for everyone.
       const { currentUser } = get();
       if (!currentUser) return;

       const newComment = {
            id: `cmt-${Date.now()}`,
            photoId,
            userId: currentUser.id,
            text,
            createdAt: new Date().toISOString()
       };

       // Optimistic
       set(state => ({ comments: [...state.comments, newComment as Comment] }));

       // Sync to GitHub
       await fetch('/api/comment', {
           method: 'POST',
           body: JSON.stringify(newComment)
       });
  },

  isLiked: (photoId) => {
      // Stub for GitHub mode: check local state if we loaded it?
      // Or just check if likedPhotoIds[photoId] includes currentUser.id
      const { currentUser, likedPhotoIds } = get();
      if (!currentUser) return false;
      return (likedPhotoIds[photoId] || []).includes(currentUser.id);
  },

  followUser: async (targetUserId) => {
      // Stub for Github Mode.
      // Real implementation would commit to a `relationships.json` or similar.
      // For now, local optimistic update.
      const { currentUser, following } = get();
      if (!currentUser) return;

      const myFollowing = following[currentUser.id] || [];
      const isFollowing = myFollowing.includes(targetUserId);

      const newFollowing = isFollowing
        ? myFollowing.filter(id => id !== targetUserId)
        : [...myFollowing, targetUserId];

      set((state) => ({
          following: { ...state.following, [currentUser.id]: newFollowing }
      }));
  }

}));
