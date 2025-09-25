export interface User {
  id: string;
  email: string;
  displayName: string;
  bio?: string;
  avatarMediaId?: string;
  createdAt: string;
  organizer?: {
    id: string;
    brandName?: string;
    verificationStatus: 'unverified' | 'pending' | 'verified';
  };
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface MagicLinkResponse {
  message: string;
  email: string;
}