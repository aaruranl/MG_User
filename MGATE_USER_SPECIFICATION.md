# MGATE User Web Application - Complete Architecture & Migration Specification

This document details the complete feature scope, data models, services, routing, guards, business logic, and UI redesign guidelines for **MG_User** (User-facing matrimony web application) migrated from **MGATE_Web**.

> **Note:** Admin features (`/admin/*`, `admin-side-bar`, `admin-login`, etc.) are explicitly excluded from this repository and will be developed in a dedicated Admin repository.

---

## 1. Executive Summary & Objective

- **Zero Business Logic Change:** Retain 100% of the API interactions, data transformations, authentication rules, OTP validations, token management, Stripe checkout flow, SignalR realtime chat, and multi-step registration steps.
- **Zero Flow Disruption:** Ensure all user states (unauthenticated, authenticated without subscription, registered without member profile, approved member, active chatting) follow the exact state transitions.
- **Modern Luxury Redesign:** Elevate the frontend aesthetic to a premier luxury standard (obsidian / deep navy slate backgrounds, champagne gold highlights, glassmorphic card overlays, responsive micro-animations, refined typography, and accessible form controls).

---

## 2. Global State & User Lifecycle Flow

```mermaid
flowchart TD
    A[Visitor Lands on Website] --> B{Action}
    B -->|Browse| C[Landing / Blogs / Success Stories / Pricing]
    B -->|Sign In / Sign Up| D[Auth Modal / Page]
    
    D --> E{Auth Successful}
    E --> F[Fetch Main User Profile]
    
    F --> G{Subscription Status}
    G -->|None / Expired| H[/member/plans -> Subscription Selection]
    H --> I[/member/payment/:id -> Stripe Payment]
    I --> J[/member/member-registration -> Multi-Step Wizard]
    
    G -->|Active & Member Count == 0| J
    G -->|Active & Pending Approval| K[/member/approval -> Under Review / Edit]
    G -->|Active & Approved| L[/home/member -> Discovery & Matches]
    
    L --> M[/home/profile/:id -> View Candidate Profile]
    L --> N[/home/chat -> Real-time SignalR Chat]
    L --> O[/home/friends -> Friend Connections]
    L --> P[/home/main-user -> Account Settings & Bio]
    L --> Q[/member/billing -> Invoices & Subscriptions]
```

---

## 3. Core Modules & Component Architecture

### 3.1 Authentication & Onboarding Module (`/login`, `/register`)
- **Login Component:**
  - Login types: Toggle between `Email` and `Phone Number` (with international dial code).
  - Client token handshake with backend (`Client/client-token`).
  - OTP challenge trigger if user verification is required (`TokenType.UserVerificationToken`).
  - Google Social Login integration.
  - Forgot password flow: (1) Enter Email/Phone -> (2) Enter OTP -> (3) Create New Password with strength meter.
  - Password strength criteria: Length $\ge 8$, Uppercase, Lowercase, Number, Special Character $\to$ (`Weak`, `Fair`, `Good`, `Excellent`).
- **Post-Login Redirection Logic:**
  - Calls `MemberService.getMainUser()`.
  - Redirects to `/member/plans` if `subscriptionStatus === none`.
  - Redirects to `/member/member-registration` if `memberCount === 0`.
  - Otherwise directs to root landing / `/home/member`.

---

### 3.2 Member Registration & Profile Wizard (`/member/*`)
- **Multi-Step Form Wizard (`member-form.component`):**
  1. **Member Profile Form (`member-profile-form`):**
     - Full name, gender, date of birth, mother tongue, marital status, profile creation for (Self, Son, Daughter, etc.).
     - Photo upload with crop/preview (`uploadImageToBulb`).
  2. **Personal Details Form (`personal-details-form`):**
     - Height, weight, blood group, body type, complexions, physical status, diet habits, smoking, drinking.
  3. **Religious Background Form (`religious-background-form`):**
     - Religion, caste / sub-caste, gotra, star / raasi, dosham / horoscope details.
  4. **Education & Career Form (`education-details-form`):**
     - Highest education, education qualification dropdown, employed in (Private, Govt, Business, Self-Employed), occupation/job type, annual income, currency.
  5. **Family Information Form (`family-information-form`):**
     - Family values, family type (Joint / Nuclear), family status, father's occupation, mother's occupation, brothers/sisters count & married status.
  6. **Contact Info Form (`contact-info-form`):**
     - Country, state, city, address line, parent/guardian phone number.
  7. **Looking For / Partner Preferences (`looking-for-form`):**
     - Preferred age range, height range, marital status preference, religion & community preference, education preference, occupation & location preferences.
- **Member Edit Form (`member-edit-form.component`):**
  - Allows editing previously submitted profile data with tabbed navigation.
- **Approval Screen (`approval.component`):**
  - Displays pending review badge, profile review status notes, and option to modify details (`modify/edit/:id`).
  - Guarded by `LeaveApprovalGuard`.

---

### 3.3 Member Home & Interaction Hub (`/home/*`)
- **Discovery / Member List (`member-home.component`):**
  - Match cards with profile picture carousel, basic stats (age, height, religion, education, location).
  - Quick actions: Send Interest / Connect, Shortlist, Direct Message.
  - Multi-criteria filter drawer/sidebar (`filter-member-list.component`):
    - Age range slider, height range, religion, community, education qualification, job type, location.
- **Member Detail View (`member-details.component`):**
  - Full candidate dossier: Comprehensive overview, horoscope details, family background, lifestyle, career details, contact request.
  - Member profile modal popup (`member-profile-modal.component`).
- **Real-Time Chat (`chat.component`):**
  - Integrated with `SignalRService` & `FriendSignalRService`.
  - Real-time instant messaging, active user presence, unread indicators, message status, emoji support.
- **Friends & Connections (`friends.component`):**
  - Tabs: Connected Friends, Pending Invitations Sent, Invitations Received, Blocked Users.
- **Main User Profile & Settings (`main-user-profile.component`):**
  - Account info, security preferences, linked profiles, privacy toggles.

---

### 3.4 Subscription & Payment Module (`/member/*`)
- **Subscription Plans (`subscription-plan.component`):**
  - Tiered plan grid (Silver, Gold, Platinum, VIP Royal).
  - Dynamic features list (view contacts, direct chat, spotlight profile, priority customer support).
  - Monthly vs Annual billing toggle.
- **Stripe Checkout (`stripe-payment.component`):**
  - Dynamic payment intent creation via `SubscriptionService.createPaymentIntent(body)`.
  - Secure Stripe Elements card input integration.
  - Success / Fail feedback handlers.
- **Billing History (`billing.component`):**
  - Active subscription card, renewal date, downloadable invoice history (`Invoice.model.ts`).
  - Payment fail banner (`payment-fail-top-bar.component`).

---

### 3.5 Marketing, CMS & Public Pages (`/*`)
- **Landing Page (`landing-page.component`):**
  - Hero header with instant matchmaking search widget (Looking for, Age from-to, Religion, Mother tongue).
  - Success story testimonials carousel.
  - Feature highlights (100% verified profiles, privacy controls, premium assistance).
  - Call to Action banners.
- **Blogs (`blogs-list.component` & `blog-details.component`):**
  - Categorized relationship advice, wedding planning, and safety tips with pagination and slug routing.
- **Success Stories (`success-stories.component` & `success-story-details.component`):**
  - Real couple stories, wedding photos, and testimonials.
- **Static Pages:**
  - `contact-us.component` (inquiry form & office locations).
  - `help-and-support.component` (FAQs, support tickets).
  - `privacy-policy.component` & `terms-and-condition.component`.
  - `page-not-found.component` (404 page).

---

## 4. API Services & Integration Matrix

| Service | Primary Endpoints / Functions |
|---|---|
| **`AuthService`** | `Client/client-token`, `Auth/register`, `Auth/login`, `Password/forgot-password`, `Password/otp-verification`, `Auth/email/verification`, `google-login`, token decode |
| **`MemberService`** | `Member/profile-list`, `Member/user-profile/{id}`, `Member/matching-profiles/{id}`, `Member/main-user-profile`, `Community`, `Religion`, `EducationQualification`, `JobType`, `Data/upload-file` |
| **`SubscriptionService`**| `SubscriptionSetup`, `MemberSubscription`, `Payment/create-intent`, `Payment/confirm`, `Invoice/list` |
| **`BlogSuccessStoryService`**| `BlogPost?pageNumber=&pageSize=`, `BlogPost/{slug}`, `SuccessStory?pageNumber=&pageSize=`, `SuccessStory/{id}` |
| **`SignalRService` & `FriendSignalRService`** | WebSockets hub connection for real-time chat messages, notifications, online presence |
| **`DataProviderService`** | Country, state, city lookup and international dial codes |
| **`SeoService`** | Dynamic page titles, meta descriptions, OpenGraph tags per route |

---

## 5. Route Map & Route Guards

```typescript
export const routes: Routes = [
  // Public / Landing
  { path: '', loadComponent: () => import('./features/landing/landing-page/landing-page.component').then(m => m.LandingPageComponent), canActivate: [DeActiveService] },
  { path: 'welcome', redirectTo: '', pathMatch: 'full' },
  { path: 'pricing', loadComponent: () => import('./features/landing/pricing/pricing.component').then(m => m.PricingComponent), canActivate: [DeActiveService] },
  { path: 'contact-us', loadComponent: () => import('./features/landing/contact-us/contact-us.component').then(m => m.ContactUsComponent), canActivate: [DeActiveService] },
  { path: 'blogs', loadComponent: () => import('./features/landing/blogs/blogs-list.component').then(m => m.BlogsListComponent) },
  { path: 'blog/:slug', loadComponent: () => import('./features/landing/blog-details/blog-details.component').then(m => m.BlogDetailsComponent) },
  { path: 'success-stories', loadComponent: () => import('./features/landing/success-stories/success-stories.component').then(m => m.SuccessStoriesListComponent) },
  { path: 'success-stories/:id', loadComponent: () => import('./features/landing/success-story-details/success-story-details.component').then(m => m.SuccessStoryDetailsComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent), canActivate: [DeActiveService] },
  
  // Member Protected Features
  {
    path: 'home',
    canActivate: [CanActivateService],
    children: [
      { path: 'member', loadComponent: () => import('./features/member-home/member-home.component').then(m => m.MemberHomeComponent) },
      { path: 'profile/:id', loadComponent: () => import('./features/member-home/member-details/member-details.component').then(m => m.MemberDetailsComponent) },
      { path: 'main-user', loadComponent: () => import('./features/member-home/main-user-profile/main-user-profile.component').then(m => m.MainUserProfileComponent) },
      { path: 'chat', loadComponent: () => import('./features/member-home/chat/chat.component').then(m => m.ChatComponent) },
      { path: 'friends', loadComponent: () => import('./features/member-home/friends/friends.component').then(m => m.FriendsComponent) }
    ]
  },
  
  // Member Onboarding & Subscriptions
  {
    path: 'member',
    children: [
      { path: 'plans', loadComponent: () => import('./features/subscription/subscription-plan/subscription-plan.component').then(m => m.SubscriptionPlanComponent), canActivate: [AuthGuardService] },
      { path: 'payment/:id', loadComponent: () => import('./features/subscription/stripe-payment/stripe-payment.component').then(m => m.StripePaymentComponent), canActivate: [AuthGuardService] },
      { path: 'profiles', loadComponent: () => import('./features/member-flow/profile-selection/profile-selection.component').then(m => m.ProfileSelectionComponent), canActivate: [AuthGuardService] },
      { path: 'member-registration', loadComponent: () => import('./features/member-flow/member-registration/member-form/member-form.component').then(m => m.MemberFormComponent), canActivate: [AuthGuardService] },
      { path: 'member-registration/edit/:id', loadComponent: () => import('./features/member-flow/member-registration/member-edit-form/member-edit-form.component').then(m => m.MemberEditFormComponent), canActivate: [AuthGuardService] },
      { path: 'billing', loadComponent: () => import('./features/subscription/billing/billing.component').then(m => m.BillingComponent), canDeactivate: [deactivateGuard] },
      { path: 'approval', loadComponent: () => import('./features/member-flow/approval/approval.component').then(m => m.ApprovalComponent), canDeactivate: [LeaveApprovalGuard] }
    ]
  },
  
  // Legal & Info
  { path: 'privacy-policy', loadComponent: () => import('./features/legal/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent) },
  { path: 'help-center', loadComponent: () => import('./features/legal/help-and-support/help-and-support.component').then(m => m.HelpAndSupportComponent) },
  { path: 'terms-and-condition', loadComponent: () => import('./features/legal/terms-and-condition/terms-and-condition.component').then(m => m.TermsAndConditionComponent) },
  { path: 'not-found', loadComponent: () => import('./features/common/not-found/not-found.component').then(m => m.PageNotFoundComponent) },
  { path: '**', redirectTo: 'not-found' }
];
```

---

## 6. UI & Design System Guidelines

- **Palette:**
  - Background: Obsidian Pearl (`#0B0F19`), Midnight Navy (`#111827`), Card Glass (`rgba(17, 24, 39, 0.7)`).
  - Accents: Royal Champagne Gold (`#D4AF37`), Antique Gold (`#C5A059`), Soft Rose Gold (`#E8B4B8`).
  - Text: Bright Platinum (`#F9FAFB`), Muted Slate (`#9CA3AF`), Warm Ivory (`#FFFDF9`).
  - Borders: Gold sheen (`rgba(212, 175, 55, 0.2)`), subtle glass outline (`rgba(255, 255, 255, 0.08)`).
- **Typography:**
  - Headings: `Playfair Display` or `Cinzel` for editorial luxury matrimonial appeal.
  - Body & Form Controls: `Inter` / `Outfit` / `Plus Jakarta Sans` for clarity and modern legibility.
- **Controls & Elements:**
  - Micro-animations on card hover, glass blur backdrops (`backdrop-filter: blur(16px)`), responsive stepped progress bars for registration, and custom pill tabs.

---

## 7. Migration Checklist

- [x] Create comprehensive architecture & scenario document (`MGATE_USER_SPECIFICATION.md`).
- [ ] Implement full Authentication flow (Phone/Email toggle, OTP validation modal, password strength meter, client-token).
- [ ] Port & Redesign 7-step Member Registration wizard (`member-form` & sub-forms).
- [ ] Port & Redesign Member Home, Filter sidebar, Profile dossier modal, and Member Details.
- [ ] Implement Real-Time Chat & Friends management with SignalR.
- [ ] Port & Redesign Subscription Plans, Stripe Elements integration, and Billing invoice view.
- [ ] Port & Redesign Public Landing page, Blog system, Success Stories, and Legal pages.
- [ ] Verify complete compilation and end-to-end user navigation flows.
