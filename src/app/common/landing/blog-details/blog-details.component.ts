import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { BlogSuccessStoryService } from '../../../core/services/blog-success-story.service';
import { environment } from '../../../../environments/environment';
import { BlogPost } from '../../../models/blog-success-story.model';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';


@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [CommonModule, RouterLink, SafeHtmlPipe],
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.scss']
})
export class BlogDetailsComponent implements OnInit {
  public baseUrl = environment.baseDomain;
  public currentYear = new Date().getFullYear();
  public blog: BlogPost | null = null;
  public isLoading: boolean = true;
  
  constructor(
    private route: ActivatedRoute,
    private BlogSuccessStoryService: BlogSuccessStoryService,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.fetchBlogDetails(slug);
      }
    });
  }

  fetchBlogDetails(slug: string) {
    this.isLoading = true;
    this.BlogSuccessStoryService.getBlogBySlug(slug).subscribe({
      next: (res: any) => {
        if (res) {
          this.blog = res;
          this.updateSEO(this.blog!);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private updateSEO(blog: any): void {
    const siteUrl = this.baseUrl.replace(/\/$/, '');
    const pageTitle = blog.metaTitle || `${blog.title} | MarriageGate Blog`;
    const pageDesc = blog.metaDescription || blog.subtitle || 'Read this article on MarriageGate.';
    const pageImage = blog.coverImage || `${siteUrl}/assets/og-default.jpg`;
    const pageUrl = `${siteUrl}/blog/${blog.slug}`;
    const publishedDate = blog.createdDate || new Date().toISOString();

    // 1. Page Title
    this.titleService.setTitle(pageTitle);

    // 2. Standard Meta Tags
    this.metaService.updateTag({ name: 'description', content: pageDesc });
    this.metaService.updateTag({ name: 'keywords', content: Array.isArray(blog.metaTags) ? blog.metaTags.join(', ') : (blog.metaTags || '') });

    // 3. Open Graph (Facebook, WhatsApp previews)
    this.metaService.updateTag({ property: 'og:title', content: pageTitle });
    this.metaService.updateTag({ property: 'og:description', content: pageDesc });
    this.metaService.updateTag({ property: 'og:image', content: pageImage });
    this.metaService.updateTag({ property: 'og:url', content: pageUrl });
    this.metaService.updateTag({ property: 'og:type', content: 'article' });
    this.metaService.updateTag({ property: 'article:published_time', content: publishedDate });
    this.metaService.updateTag({ property: 'article:section', content: blog.category || 'Matrimony' });

    // 4. Twitter Card
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: pageTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: pageDesc });
    this.metaService.updateTag({ name: 'twitter:image', content: pageImage });

    // 5. Canonical URL
    this.setCanonical(pageUrl);

    // 6. JSON-LD Schema Markup (BlogPosting)
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': blog.title,
      'description': pageDesc,
      'image': pageImage,
      'url': pageUrl,
      'datePublished': publishedDate,
      'dateModified': publishedDate,
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
    this.injectJsonLd('blog-schema', schema);
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
    // Remove old script if exists (prevent duplicates on navigation)
    const old = document.getElementById(id);
    if (old) old.remove();

    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }
}
