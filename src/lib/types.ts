// Shared Types
export interface User {
    id: string;
    username: string;
    name: string;
    avatar: string;
    email: string;
    bio?: string;
}

export interface Photo {
    id: string;
    url: string;
    title: string;
    description: string;
    userId: string;
    width?: number;
    height?: number;
    createdAt: string;
    likes: number;
}

export interface Comment {
      id: string;
      photoId: string;
      userId: string;
      text: string;
      createdAt: string;
}

export interface Album {
      id: string;
      userId: string;
      name: string;
      description: string;
      coverPhotoId?: string;
      createdAt: string;
}
