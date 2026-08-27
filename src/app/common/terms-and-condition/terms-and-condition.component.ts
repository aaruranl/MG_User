import { Component } from '@angular/core';

@Component({
  selector: 'app-terms-and-condition',
  imports: [],
  templateUrl: './terms-and-condition.component.html',
  styleUrl: './terms-and-condition.component.scss'
})
export class TermsAndConditionComponent {

    public currentYear = new Date().getFullYear();

ngOnInit() {
     window.scrollTo({ top: 0, behavior: 'smooth' });
   
  }
}
