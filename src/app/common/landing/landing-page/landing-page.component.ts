import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ROUTER_MODULES } from '../../common-imports';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [NgFor, NgClass, ROUTER_MODULES],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent implements OnInit, OnDestroy {
  public baseUrl = environment.baseDomain;
  public currentYear = new Date().getFullYear();

  public currentHeroIndex = 0;
  public heroImages = [
    {
      url: 'https://dev1mg.blob.core.windows.net/mgate/common/hero_h.jpg',
      title: 'Hindu',
      subtitle: 'Traditions',
      headline: 'Vibrant Hindu Weddings',
      description: 'Celebrate your union with sacred rituals and timeless traditions. We connect hearts within the Hindu community worldwide.',
      themeClass: 'hindu-theme'
    },
    {
      url: 'https://dev1mg.blob.core.windows.net/mgate/common/hero_c.jpg',
      title: 'Christian',
      subtitle: 'Heritage',
      headline: 'Graceful Christian Unions',
      description: 'Start your beautiful journey of faith and love together. We help Christian singles find their soulmate in Christ.',
      themeClass: 'christian-theme'
    },
    {
      url: 'https://dev1mg.blob.core.windows.net/mgate/common/hero_m.jpg',
      title: 'Muslim',
      subtitle: 'Values',
      headline: 'Sacred Muslim Nikah',
      description: 'Find your perfect partner who shares your faith and values. Dedicated to connecting Muslim singles for a blessed journey.',
      themeClass: 'muslim-theme'
    },
    {
      url: 'https://dev1mg.blob.core.windows.net/mgate/common/hero_b.png',
      title: 'Buddhist',
      subtitle: 'Wisdom',
      headline: 'Peaceful Buddhist Unions',
      description: 'Embark on a mindful journey of love and compassion. Connecting Buddhist singles who seek harmony and enlightenment together.',
      themeClass: 'buddhist-theme'
    }
  ];

  public milestones = [
    { year: '2019', title: 'The Beginning', description: 'Started our journey in Switzerland, connecting Asian communities with a mission to bring hearts together.' },
    { year: '2021', title: 'Expanding Horizons', description: 'Reached more Asian countries and European countries through mobile phones, connecting more people across borders.' },
    { year: '2023', title: 'Social Media Launch', description: 'Landed on social media platforms and welcomed more people to our trusted service, building a stronger community.' },
    { year: '2026', title: 'MarriageGate Platform', description: 'Coming as MarriageGate platform for more global connections, expanding our service to reach even more hearts worldwide.' }
  ];

  private intervalId: any;

  ngOnInit() {
     window.scrollTo({ top: 0, behavior: 'smooth' });
    this.startHeroCycling();
  }

  ngOnDestroy() {
    this.stopHeroCycling();
  }

  private startHeroCycling() {
    this.stopHeroCycling(); // Clear any existing
    this.intervalId = setInterval(() => {
      this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroImages.length;
    }, 5000); // Cycle every 5 seconds as requested
  }

  private stopHeroCycling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  public setHeroIndex(index: number) {
    this.currentHeroIndex = index;
    this.startHeroCycling(); // Restart timer
  }
}
