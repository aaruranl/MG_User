import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs';
import { CommonResponse } from '../../models/commonResponse.model';
import { BlogPost, SuccessStory } from '../../models/blog-success-story.model';

@Injectable({
  providedIn: 'root'
})
export class BlogSuccessStoryService {
  private baseUrl = (environment as any).baseUrl;

  constructor(private http: HttpClient) { }

  // --- Blogs ---

  public getBlogsWithPagination(pageNumber: number, pageSize: number, status: number = 0) {
      let url = this.baseUrl + `BlogPost?pageNumber=${pageNumber}&pageSize=${pageSize}`;
      if (status !== 0) {
          url += `&Status=${status}`;
      }
      return this.http.get(url).pipe(
        map((res: any) => {
          return new CommonResponse<BlogPost>(res.Result, BlogPost);
        })
      );
  }

  public getBlogById(id: string) {
    return this.http.get<any>(this.baseUrl + `BlogPost/${id}`).pipe(
      map((res: any) => new BlogPost(res?.Result))
    );
  }

  public getBlogBySlug(slug: string) {
    return this.http.get<any>(this.baseUrl + `BlogPost/slug/${slug}`).pipe(
      map((res: any) => new BlogPost(res?.Result))
    );
  }

  public createBlog(body: any) {
    return this.http.post<any>(this.baseUrl + 'BlogPost', body);
  }

  public editBlog(id: string, body: any) {
    return this.http.put<any>(this.baseUrl + `BlogPost/${id}`, body);
  }

  public deleteBlog(id: string) {
    return this.http.delete<any>(this.baseUrl + `BlogPost?id=${id}`);
  }

  // --- Success Stories ---

  public getSuccessStoriesWithPagination(pageNumber: number, pageSize: number, status: number = 0) {
      let url = this.baseUrl + `SuccessStory?pageNumber=${pageNumber}&pageSize=${pageSize}`;
      if (status !== 0) {
          url += `&Status=${status}`;
      }
      return this.http.get(url).pipe(
        map((res: any) => {
          return new CommonResponse<SuccessStory>(res.Result, SuccessStory);
        })
      );
  }

  public getSuccessStoryById(id: string) {
    return this.http.get<any>(this.baseUrl + `SuccessStory/${id}`).pipe(
      map((res: any) => new SuccessStory(res?.Result))
    );
  }

  public createSuccessStory(body: any) {
    return this.http.post<any>(this.baseUrl + 'SuccessStory', body);
  }

  public editSuccessStory(id: string, body: any) {
    return this.http.put<any>(this.baseUrl + `SuccessStory/${id}`, body);
  }

  public deleteSuccessStory(id: string) {
    return this.http.delete<any>(this.baseUrl + `SuccessStory?id=${id}`);
  }
}
