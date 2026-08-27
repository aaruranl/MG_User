import { Routes } from '@angular/router';
import { DeActiveService } from './core/middleware/de-active.service';
import { CanActivateService } from './core/middleware/can-active.service';
import { userRoleNames as role } from './helpers/util';
import { AuthGuardService } from './core/middleware/auth-guard.service';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./common/landing/landing-page/landing-page.component').then(m => m.LandingPageComponent),
    canActivate: [DeActiveService],
    data: { seo: { title: 'Welcome to MGATE', description: 'Join MGATE to find your perfect match. The best matrimony platform.', ogTitle: 'Welcome to MGATE', ogDescription: 'Join MGATE to find your perfect match.', ogType: 'website' } }
  },
  { path: 'welcome', redirectTo: '', pathMatch: 'full' },
  {
    path: 'contact-us',
    loadComponent: () => import('./common/landing/contact-us/contact-us.component').then(m => m.ContactUsComponent),
    canActivate: [DeActiveService],
    data: { seo: { title: 'Contact Us | MGATE', description: 'Get in touch with MGATE support team for any queries or help.', ogTitle: 'Contact Us | MGATE', ogDescription: 'Get in touch with MGATE support team.', ogType: 'website' } }
  },
  {
    path: 'pricing',
    loadComponent: () => import('./common/landing/pricing/pricing.component').then(m => m.PricingComponent),
    canActivate: [DeActiveService],
    data: { seo: { title: 'Pricing Plans | MGATE', description: 'Explore MGATE affordable pricing plans to unlock premium matrimony features.', ogTitle: 'Pricing Plans | MGATE', ogDescription: 'Explore MGATE affordable pricing plans.', ogType: 'website' } }
  },
  {
    path: 'blogs',
    loadComponent: () => import('./common/landing/blogs/blogs-list.component').then(m => m.BlogsListComponent),
    data: { seo: { title: 'Blogs & Tips | MGATE', description: 'Matrimonial tips, safety guides, and relationship advice.', ogType: 'website' } }
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./common/landing/blog-details/blog-details.component').then(m => m.BlogDetailsComponent),
  },
  {
    path: 'success-stories',
    loadComponent: () => import('./common/landing/success-stories/success-stories.component').then(m => m.SuccessStoriesListComponent),
    data: { seo: { title: 'Success Stories | MGATE', description: 'Real stories from couples who found love on MGATE.', ogType: 'website' } }
  },
  {
    path: 'success-stories/:id',
    loadComponent: () => import('./common/landing/success-story-details/success-story-details.component').then(m => m.SuccessStoryDetailsComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [DeActiveService],
    data: { seo: { title: 'Login | MGATE', description: 'Login to your MGATE account to connect with potential matches.', ogTitle: 'Login | MGATE', ogDescription: 'Login to your MGATE account.', ogType: 'website' } }
  },
  {
    path: 'not-found',
    loadComponent: () => import('./components/page-not-found/page-not-found.component').then(m => m.PageNotFoundComponent),
    data: { seo: { title: 'Page Not Found | MGATE', description: 'The page you requested could not be found.', ogTitle: 'Page Not Found | MGATE', ogDescription: 'The page you requested could not be found.', ogType: 'website' } }
  },
  {
    path: 'home',
    loadChildren: () => import('./components/modules/home/home.routing.module').then(m => m.HomeRoutingModules),
    canActivate: [CanActivateService],
    data: { accessUsers: [role.member] }
  },
  {
    path: 'member',
    loadChildren: () => import('./components/modules/member/member.routing.module').then(m => m.MembersRoutingModules),
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./common/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent),
    data: { seo: { title: 'Privacy Policy | MGATE', description: 'Read MGATE privacy policy to understand how your data is handled.', ogTitle: 'Privacy Policy | MGATE', ogDescription: 'Read MGATE privacy policy.', ogType: 'website' } }
  },
  {
    path: 'help-center',
    loadComponent: () => import('./common/help-and-support/help-and-support.component').then(m => m.HelpAndSupportComponent),
    data: { seo: { title: 'Help Center | MGATE', description: 'Visit MGATE help center for support and FAQs.', ogTitle: 'Help Center | MGATE', ogDescription: 'Visit MGATE help center for support and FAQs.', ogType: 'website' } }
  },
  {
    path: 'terms-and-condition',
    loadComponent: () => import('./common/terms-and-condition/terms-and-condition.component').then(m => m.TermsAndConditionComponent),
    data: { seo: { title: 'Terms and Conditions | MGATE', description: 'Read the terms and conditions for using MGATE matrimony services.', ogTitle: 'Terms and Conditions | MGATE', ogDescription: 'Read the terms and conditions for using MGATE.', ogType: 'website' } }
  },
  {
    path: '**',
    loadComponent: () => import('./components/page-not-found/page-not-found.component').then(m => m.PageNotFoundComponent),
  }
];
