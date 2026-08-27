export interface User {
  id: string;
  email: string;
  name: string;
  role: 'member' | 'guest';
  memberId?: string;
  profilePic?: string;
  isVerified?: boolean;
  membershipPlan?: string;
}

export interface MemberProfile {
  id: string;
  fullName: string;
  age: number;
  gender: 'male' | 'female';
  maritalStatus: string;
  religion: string;
  caste?: string;
  height: string;
  education: string;
  occupation: string;
  city: string;
  state: string;
  country: string;
  aboutMe: string;
  avatarUrl: string;
  galleryImages: string[];
  isVerified: boolean;
  isPremium: boolean;
  matchScore?: number;
  annualIncome?: string;
  hobbies?: string[];
  partnerPreferences?: {
    ageRange: [number, number];
    heightRange: [string, string];
    maritalStatus: string[];
    religion: string[];
    education: string[];
    location: string[];
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  featured?: boolean;
  badge?: string;
  features: string[];
}

export interface Story {
  id: string;
  coupleNames: string;
  weddingDate: string;
  quote: string;
  story: string;
  imageUrl: string;
  location: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  readTime: string;
  publishedDate: string;
  imageUrl: string;
  author: string;
}
