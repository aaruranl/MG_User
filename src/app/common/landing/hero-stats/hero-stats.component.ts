import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-hero-stats',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero-stats.component.html',
  styleUrls: ['./hero-stats.component.scss']
})
export class HeroStatsComponent {
  public baseUrl = environment.baseDomain;

  get isBlog(): boolean {
    return !this.router.url.includes('/success-stories');
  }

  constructor(public router: Router) {}
}
