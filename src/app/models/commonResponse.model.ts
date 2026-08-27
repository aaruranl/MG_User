export class CommonResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
  pendingApproval:number;

  constructor(obj: any, modelClass?: new (item: any) => T) {
    this.data = obj.data && modelClass ? obj.data.map((item: any) => new modelClass(item)) : obj.data ?? [];
    this.totalCount = obj.totalCount ?? 0;
    this.pageNumber = obj.pageNumber ?? 0;
    this.pageSize = obj.pageSize ?? 0;
    this.totalPages = obj.totalPages ?? 0;
    this.hasPrevious = obj.hasPrevious ?? false;
    this.hasNext = obj.hasNext ?? false;
    this.pendingApproval = obj.pendingApproval ?? 0;
  }
}

export class CommonNotificationResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  totalUnreadCount:number;
  pageSize: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;

  constructor(obj: any, modelClass?: new (item: any) => T) {
    this.data = obj.notifications && modelClass ? obj.notifications.map((item: any) => new modelClass(item)) : obj.notifications ?? [];
    this.totalCount = obj.totalCount ?? 0;
    this.pageNumber = obj.pageNumber ?? 0;
    this.pageSize = obj.pageSize ?? 0;
    this.totalPages = obj.totalPages ?? 0;
    this.hasPrevious = obj.hasPrevious ?? false;
    this.hasNext = obj.hasNext ?? false;
    this.totalUnreadCount = obj.totalUnreadCount ?? 0;
  }
}
