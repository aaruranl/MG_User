import { MemberService } from './../../../../../core/services/member.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-friends',
  imports: [CommonModule],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.scss'
})
export class FriendsComponent {
selectedTab: string = 'friends';
constructor(public _memberService:MemberService){}

ngOnInit(): void {
 this._memberService.GetFriends().subscribe({
  next : (res:any) =>{

  },
  complete:()=>{

  }
 })
}

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

}
