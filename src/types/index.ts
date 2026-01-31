export interface User {
  id: number;
  phone: string;
  firstName: string;
  lastName: string;
  isChild: boolean;
  theme: string;
  familyCode?: string;
}

export interface Project {
  id: number;
  title: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  isChildProject?: boolean;
  childName?: string;
}

export interface Sticker {
  id: number;
  name: string;
  emoji: string;
  category: string;
}

export interface CanvasObject {
  id: string;
  type: 'image' | 'sticker' | 'drawing';
  x: number;
  y: number;
  width?: number;
  height?: number;
  data?: any;
}
