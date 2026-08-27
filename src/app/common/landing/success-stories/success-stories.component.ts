import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogSuccessStoryService } from '../../../core/services/blog-success-story.service';
import { environment } from '../../../../environments/environment';
import { HeroStatsComponent } from '../hero-stats/hero-stats.component';
import { SuccessStory } from '../../../models/blog-success-story.model';
import {ContentStatus} from '../../../helpers/enum'
import { LoadingComponent } from '../../loading/loading.component';

@Component({
  selector: 'app-success-stories-public',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent, HeroStatsComponent],
  templateUrl: './success-stories.component.html',
  styleUrls: ['./success-stories.component.scss']
})
export class SuccessStoriesListComponent implements OnInit {
  public baseUrl = environment.baseDomain;
  public currentYear = new Date().getFullYear();
  public stories: SuccessStory[] = [];
  public isLoading: boolean = true;
  public currentPage: number = 1;
  public itemsPerPage: number = 10;
  public totalItemCount: number = 0;
  
  constructor(private BlogSuccessStoryService: BlogSuccessStoryService) {}

  ngOnInit(): void {
    this.fetchStories();
  }

  fetchStories() {
    this.isLoading = true;
    this.BlogSuccessStoryService.getSuccessStoriesWithPagination(this.currentPage, this.itemsPerPage, ContentStatus.Published).subscribe({
      next: (res: any) => {
        if (res.data && res.data.length > 0) {
          this.stories = res.data.map((s: any) => new SuccessStory(s));
          this.totalItemCount = res.totalCount;
        } else {
          this.stories = [];
          this.totalItemCount = 0;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
