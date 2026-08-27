import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { BlogSuccessStoryService } from '../../../core/services/blog-success-story.service';
import { environment } from '../../../../environments/environment';
import { SuccessStory } from '../../../models/blog-success-story.model';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';


import { LoadingComponent } from '../../loading/loading.component';

@Component({
  selector: 'app-success-story-details',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent, SafeHtmlPipe],
  templateUrl: './success-story-details.component.html',
  styleUrls: ['./success-story-details.component.scss']
})
export class SuccessStoryDetailsComponent implements OnInit {
  public baseUrl = environment.baseDomain;
  public currentYear = new Date().getFullYear();
  public story: SuccessStory | null = null;
  public isLoading: boolean = true;
  
  // Mock data if API fails

  public gallery: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private BlogSuccessStoryService: BlogSuccessStoryService,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchStoryDetails(id);
      }
    });
  }

  fetchStoryDetails(id: string) {
    this.isLoading = true;
    this.BlogSuccessStoryService.getSuccessStoryById(id).subscribe({
      next: (res: any) => {
        if (res) {
          
          this.story = res;
          this.gallery = this.story?.weddingGallery?.map(img => img.url) || [];
          this.updateSEO(this.story);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }



  private updateSEO(story: any): void {
    const siteUrl = this.baseUrl.replace(/\/$/, '');
    const pageTitle = story.metaTitle || `${story.coupleNames}'s Success Story | MarriageGate`;
    const pageDesc = story.metaDescription || `Read the beautiful love story of ${story.coupleNames} who found each other on MarriageGate.`;
    const pageImage = story.coverPhoto || `${siteUrl}/assets/og-default.jpg`;
    const pageUrl = `${siteUrl}/success-stories/${story.id}`;
    const weddingDate = story.weddingDate || new Date().toISOString();

    // 1. Page Title
    this.titleService.setTitle(pageTitle);

    // 2. Standard Meta Tags
    this.metaService.updateTag({ name: 'description', content: pageDesc });
    this.metaService.updateTag({ name: 'keywords', content: story.metaTags || `${story.coupleNames}, success story, MarriageGate, matrimony, ${story.location || 'India'}` });

    // 3. Open Graph (Facebook, WhatsApp previews)
    this.metaService.updateTag({ property: 'og:title', content: pageTitle });
    this.metaService.updateTag({ property: 'og:description', content: pageDesc });
    this.metaService.updateTag({ property: 'og:image', content: pageImage });
    this.metaService.updateTag({ property: 'og:url', content: pageUrl });
    this.metaService.updateTag({ property: 'og:type', content: 'article' });

    // 4. Twitter Card
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: pageTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: pageDesc });
    this.metaService.updateTag({ name: 'twitter:image', content: pageImage });

    // 5. Canonical URL
    this.setCanonical(pageUrl);

    // 6. JSON-LD Schema (Article type for success stories)
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': pageTitle,
      'description': pageDesc,
      'image': pageImage,
      'url': pageUrl,
      'datePublished': weddingDate,
      'about': {
        '@type': 'Event',
        'name': `Wedding of ${story.coupleNames}`,
        'startDate': weddingDate,
        'location': {
          '@type': 'Place',
          'name': story.location || 'India'
        }
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'MarriageGate',
        'logo': {
          '@type': 'ImageObject',
          'url': `${siteUrl}/assets/logo.png`
        }
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': pageUrl
      }
    };
    this.injectJsonLd('story-schema', schema);
  }

  private setCanonical(url: string): void {
    let el = document.querySelector('link[rel="canonical"]');
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      document.head.appendChild(el);
    }
    el.setAttribute('href', url);
  }

  private injectJsonLd(id: string, schema: object): void {
    const old = document.getElementById(id);
    if (old) old.remove();

    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }
}

