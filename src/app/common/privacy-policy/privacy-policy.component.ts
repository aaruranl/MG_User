import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy-policy',
  imports: [],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
    public currentYear = new Date().getFullYear();

 ngOnInit() {
     window.scrollTo({ top: 0, behavior: 'smooth' });
   
  }
}
