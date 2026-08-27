import { ContentStatus } from '../helpers/enum';
export class BlogPost {
  id: string;
  createdDate: string;
  updatedDate: string;
  title: string;
  subtitle: string;
  coverImage: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  metaTags: string;
  status: number;
  category?: string;
  slug: string;

  constructor(obj: any) {
    this.id = obj?.id ?? '';
    this.createdDate = obj?.createdDate ?? '';
    this.updatedDate = obj?.updatedDate ?? '';
    this.title = obj?.title ?? '';
    this.subtitle = obj?.subtitle ?? '';
    this.coverImage = obj?.coverImage ?? '';
    this.content = (obj?.content ?? '').replace(/&nbsp;/g, ' ');
    this.metaTitle = obj?.metaTitle ?? '';
    this.metaDescription = obj?.metaDescription ?? '';
    this.metaTags = obj?.metaTags ?? '';
    this.status = obj?.status ?? ContentStatus.Draft;
    this.category = obj?.category || 'Article';
    this.slug = obj?.slug ?? '';
  }
}

export class SuccessStory {
  id: string;
  createdDate: string;
  updatedDate: string;
  coupleNames: string;
  weddingDate: string;
  storyContent: string;
  coverPhoto: string;
  location: string;
  metaTitle: string;
  metaDescription: string;
  metaTags: string;
  status: number;
  weddingGallery: { url: string }[];

  constructor(obj: any) {
    this.id = obj?.id ?? '';
    this.createdDate = obj?.createdDate ?? '';
    this.updatedDate = obj?.updatedDate ?? '';
    this.coupleNames = obj?.coupleNames ?? '';
    this.weddingDate = obj?.weddingDate ?? '';
    this.storyContent = (obj?.storyContent ?? '').replace(/&nbsp;/g, ' ');
    this.coverPhoto = obj?.coverPhoto ?? '';
    this.location = obj?.location ?? '';
    this.metaTitle = obj?.metaTitle ?? '';
    this.metaDescription = obj?.metaDescription ?? '';
    this.metaTags = obj?.metaTags ?? '';
    this.status = obj?.status ?? ContentStatus.Draft;
    this.weddingGallery = obj?.weddingGallery ?? [];
  }
}
