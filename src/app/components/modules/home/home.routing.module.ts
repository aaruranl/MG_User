import { Routes } from '@angular/router';
import { userRoleNames as role } from '../../../helpers/util';

export const HomeRoutingModules: Routes = [
 {
  path:'member',
  loadComponent: () => import('./member-home/member-home.component').then(m => m.MemberHomeComponent),
  data:{accessUsers: [role.member]},
  children: [
    {
      path: 'profile',
      loadComponent: () => import('./member-home/member-details/member-details.component').then(m => m.MemberDetailsComponent)
    }
  ]
 },
 {
  path:'profile/:id',
  loadComponent: () => import('./member-home/member-details/member-details.component').then(m => m.MemberDetailsComponent),
  data:{accessUsers: [role.member]}
 },
 {
  path:'main-user',
  loadComponent: () => import('./main-user-profile/main-user-profile.component').then(m => m.MainUserProfileComponent),
  data:{accessUsers: [role.member]}
 },

 {
  path:'chat',
  loadComponent: () => import('./member-home/chat/chat.component').then(m => m.ChatComponent),
  data:{accessUsers: [role.member]}
 },

 {
  path:'friends',
  loadComponent: () => import('./member-home/friends/friends.component').then(m => m.FriendsComponent),
  data:{accessUsers: [role.member]}
 },

];




