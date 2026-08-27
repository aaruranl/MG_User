import { MemberService } from './../../../../core/services/member.service';
import { Component, effect, HostListener } from '@angular/core';
import { SideBarComponent } from "../../../../common/side-bar/side-bar.component";
import { FilterMemberListComponent } from "./filter-member-list/filter-member-list.component";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-member-home',
  imports: [SideBarComponent, FilterMemberListComponent, CommonModule],
  templateUrl: './member-home.component.html',
  styleUrl: './member-home.component.scss'
})
export class MemberHomeComponent {
 public screenWidth: number = window.innerWidth;
 public isLoading:boolean = true;
 public isInitialLoad:boolean = false;

  constructor(public memberService:MemberService){
    effect(()=>{
      this.isInitialLoad = memberService.isInitialLoad();
    })
  }

  ngOnInit(): void {
   this.updateScreenWidth();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    this.updateScreenWidth();
  }

  private updateScreenWidth(): void {
    this.screenWidth = window.innerWidth;
  }

  public loadChildEmitter(event:any){
    this.isLoading = event;
  }

}
