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
  saved: Record<string, string[]>; // userId -> photoId[]

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

  // New Actions
  savePhoto: (photoId: string) => Promise<void>;
  isSaved: (photoId: string) => boolean;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: [],
  photos: [],
  albums: [],
  comments: [],
  likedPhotoIds: {},
  following: {},
  saved: {},
  loading: false,
  error: null,

  initAuth: () => {
    // init netlify identity
    if (typeof window !== 'undefined') {
        // Hardcode API URL to bypass auto-detection issues
        netlifyIdentity.init({
            APIUrl: 'https://mygaleriku.netlify.app/.netlify/identity',
            logo: false // optional
        });
        const updateCurrentUser = (user: any) => {
             const mappedUser = {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                username: user.email?.split('@')[0] || 'user',
                avatar: user.user_metadata?.avatar_url || ''
            };
            set({ currentUser: mappedUser });

            // Also add to users list immediately
            set((state) => {
                const exists = state.users.find(u => u.id === mappedUser.id);
                if (!exists) {
                    return { users: [...state.users, mappedUser] };
                }
                return {};
            });
        };

        const user = netlifyIdentity.currentUser();
        if (user) {
            updateCurrentUser(user);
        }

        netlifyIdentity.on('login', (user: any) => {
            updateCurrentUser(user);
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
          let fetchedUsers = data.users || [];

          // Ensure current user is in the list (for Profile page to work)
          const { currentUser } = get();
          if (currentUser) {
              const exists = fetchedUsers.find((u: User) => u.id === currentUser.id);
              if (!exists) {
                  fetchedUsers = [...fetchedUsers, currentUser];
              }
          }

          set({
              photos: data.photos || [],
              users: fetchedUsers,
              comments: data.comments || [],
              likedPhotoIds: data.likes || {},
              following: data.following || {},
              saved: data.saved || {},
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
      const { currentUser, likedPhotoIds } = get();
      if (!currentUser) return;

      // Optimistic
      const currentLikes = likedPhotoIds[photoId] || [];
      const hasLiked = currentLikes.includes(currentUser.id);

      const newLikes = hasLiked
        ? currentLikes.filter(id => id !== currentUser.id)
        : [...currentLikes, currentUser.id];

      set(state => ({
        likedPhotoIds: { ...state.likedPhotoIds, [photoId]: newLikes }
      }));

      // API
      await fetch('/api/action', {
          method: 'POST',
          body: JSON.stringify({
              action: 'like',
              payload: { photoId, userId: currentUser.id }
          })
      });
  },

  addComment: async (photoId, text) => {
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

       // Generic API
       await fetch('/api/action', {
           method: 'POST',
           body: JSON.stringify({
               action: 'comment',
               payload: newComment
           })
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

       await fetch('/api/action', {
           method: 'POST',
           body: JSON.stringify({
               action: 'follow',
               payload: { followerId: currentUser.id, targetId: targetUserId }
           })
       });
  },

  savePhoto: async (photoId) => {
      const { currentUser, saved } = get();
      if (!currentUser) return;

      const mySaved = saved[currentUser.id] || [];
      const isSaved = mySaved.includes(photoId);

      const newSaved = isSaved
        ? mySaved.filter(id => id !== photoId)
        : [...mySaved, photoId];

      set(state => ({
          saved: { ...state.saved, [currentUser.id]: newSaved }
      }));

       await fetch('/api/action', {
           method: 'POST',
           body: JSON.stringify({
               action: 'save',
               payload: { userId: currentUser.id, photoId }
           })
       });
  },

  isSaved: (photoId) => {
       const { currentUser, saved } = get();
       if (!currentUser) return false;
       return (saved[currentUser.id] || []).includes(photoId);
  },

  updateProfile: async (data) => {
      const { currentUser, users } = get();
      if (!currentUser) return;

      const newUserData = { ...currentUser, ...data };

      // Optimistic
      set({ currentUser: newUserData });

      // Update in users list too
      set(state => ({
          users: state.users.map(u => u.id === currentUser.id ? newUserData : u)
      }));

       await fetch('/api/action', {
           method: 'POST',
           body: JSON.stringify({
               action: 'updateProfile',
               payload: { userId: currentUser.id, data }
           })
       });
  }

}));
