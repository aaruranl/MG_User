import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private metaService: Meta
  ) {}

  init() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      filter(route => route.outlet === 'primary'),
      mergeMap(route => route.data)
    ).subscribe((data: any) => {
      if (data.seo) {
        this.updateTags(data.seo);
      } else {
        // Fallback default tags for routes without explicitly defined SEO data
        this.updateTags({
          title: 'Marriage Gate',
          description: 'MGATE - The best matrimony platform to find your perfect match.',
          ogTitle: 'MarriageGate - Find Your Perfect Match',
          ogDescription: 'MarriageGate helps you find the perfect life partner with advanced matching and verified profiles.',
          ogType: 'website',
          keywords: ''
        });
      }
    });
  }

  private updateTags(seo: any) {
    if (seo.title) {
      this.titleService.setTitle(seo.title);
    }
    if (seo.description) {
      this.metaService.updateTag({ name: 'description', content: seo.description });
    }
    this.metaService.updateTag({ name: 'keywords', content: seo.keywords || '' });
    
    if (seo.ogTitle) {
      this.metaService.updateTag({ property: 'og:title', content: seo.ogTitle });
    }
    if (seo.ogDescription) {
      this.metaService.updateTag({ property: 'og:description', content: seo.ogDescription });
    }
    if (seo.ogType) {
      this.metaService.updateTag({ property: 'og:type', content: seo.ogType });
    }
    
    const siteUrl = environment.baseDomain.replace(/\/$/, '');
    const currentUrl = siteUrl + this.router.url;
    this.metaService.updateTag({ property: 'og:url', content: currentUrl });
  }
}
