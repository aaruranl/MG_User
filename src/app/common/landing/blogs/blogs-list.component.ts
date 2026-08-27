import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogSuccessStoryService } from '../../../core/services/blog-success-story.service';
import { environment } from '../../../../environments/environment';
import { HeroStatsComponent } from '../hero-stats/hero-stats.component';
import { BlogPost } from '../../../models/blog-success-story.model';
import {ContentStatus} from '../../../../app/helpers/enum'
import { LoadingComponent } from '../../loading/loading.component';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-blogs-public',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent, HeroStatsComponent, NgxPaginationModule],
  templateUrl: './blogs-list.component.html',
  styleUrls: ['./blogs-list.component.scss']
})
export class BlogsListComponent implements OnInit {
  public baseUrl = environment.baseDomain;
  public currentYear = new Date().getFullYear();
  public blogs: BlogPost[] = [];
  public itemsPerPage: number = 9;
  public totalItemCount: number = 0;
  public currentPage: number = 1;
  public isLoading: boolean = true;
  
  constructor(private BlogSuccessStoryService: BlogSuccessStoryService) {}

  ngOnInit(): void {
    this.fetchBlogs();
  }

  fetchBlogs() {
    this.isLoading = true;
    this.BlogSuccessStoryService.getBlogsWithPagination(this.currentPage, this.itemsPerPage, ContentStatus.Published).subscribe({
      next: (res: any) => {
        if (res.data && res.data.length > 0) {
          this.blogs = res.data;
          this.totalItemCount = res.totalCount;
        } else {
          this.blogs = [];
          this.totalItemCount = 0;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  public pageChanged(event: any) {
    this.currentPage = event;
    this.fetchBlogs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
