
import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth.guard';
import { userRoleNames as role } from '../../../helpers/util';
import { deactivateGuard } from '../../../core/guards/deactivate.guard';
import { leaveApprovalGuard } from '../../../core/guards/approval.guard';


export const MembersRoutingModules: Routes = [
{
  path:'plans',
  loadComponent:()=>import('./subscription-plan/subscription-plan.component').then(m => m.SubscriptionPlanComponent),
  canActivate:[authGuard],
  data:{accessUsers: [role.member]}
 },
 {
  path:'payment/:id',
  loadComponent:()=>import('./stripe-payment/stripe-payment.component').then(m => m.StripePaymentComponent),
  canActivate:[authGuard],
  data:{accessUsers: [role.member]}
 },
 {
  path:'profiles',
  loadComponent:()=>import('./profile-selection/profile-selection.component').then(m => m.ProfileSelectionComponent),
  canActivate:[authGuard],
  data:{accessUsers: [role.member]}
 },

 {
  path:'member-registration',
  loadComponent:() => import('./member-registration/member-form/member-form.component').then(m => m.MemberFormComponent),
  canActivate:[authGuard],
  data:{accessUsers: [role.member]}
 },

 {
  path:'member-registration/edit/:id',
  loadComponent:() => import('./member-registration/member-form/member-form.component').then(m => m.MemberFormComponent),
  canActivate:[authGuard],
  data:{accessUsers: [role.member]}
 },
 {
  path:'billing',
  loadComponent:() => import('./billing/billing.component').then(m => m.BillingComponent),
  data:{accessUsers: [role.member]},
  canDeactivate: [deactivateGuard]
},
{
  path:'approval',
  loadComponent:()=>import('./approval/approval.component').then(m => m.ApprovalComponent),
  canDeactivate: [leaveApprovalGuard],
  children: [
    {
      path: 'modify/edit/:id',
      loadComponent: () => import('./member-registration/member-form/member-form.component').then(m => m.MemberFormComponent)
    }
  ]
},

];
