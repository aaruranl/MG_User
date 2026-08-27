import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Subject } from 'rxjs';
import { Community, Education, FullUserProfile, MainUser, MemberProfile, NotificationItem, Religion, RequestList, UserProfile } from '../../models/index.model';
import { CommonNotificationResponse, CommonResponse } from '../../models/commonResponse.model';


@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private baseUrl = (environment as any).baseUrl;
  public profileQuestionData:any;

  private filterSource = new BehaviorSubject<any>(null);
  filter$ = this.filterSource.asObservable();

  public isInitialLoad = signal(false);


  constructor(private http: HttpClient) { }

  public setQuestionData(data:any){
    this.profileQuestionData = data;
  }

  public getQuestionData() : any{
   return this.profileQuestionData;
  }



  setFilter(data: any) {
    this.filterSource.next(data);
  }

  public uploadImageToBulb(body:any){
    return this.http.post<any>(this.baseUrl + 'Data/upload-file', body);
  }

  public getCommunity(){
    return this.http.get(this.baseUrl + 'Community').pipe(
        map((res: any) => {
          return res.Result.data.map((data:any) => new Community(data));
      })
    );
  }

  public getCommunityWithPagination(pageNumber:number, pageSize:number){
    return this.http.get(this.baseUrl + `Community?pageNumber=${pageNumber}&pageSize=${pageSize}`).pipe(
        map((res: any) => {
          return new CommonResponse<Community>(res.Result, Community);
      })
    );
  }

  public getReligion(){
    return this.http.get(this.baseUrl + 'Religion').pipe(
        map((res: any) => {
          return res.Result.data.map((data:any) => new Religion(data));
      })
    );
  }

  public getEducationQualification(){
     return this.http.get(this.baseUrl + 'EducationQualification').pipe(
        map((res: any) => {
          return res.Result.data.map((data:any) => new Education(data));
      })
    );
  }

   public getJobType(){
     return this.http.get(this.baseUrl + 'JobType').pipe(
        map((res: any) => {
          return res.Result.data.map((data:any) => new Education(data));
      })
    );
  }

  public createProfile(body:any){
    return this.http.post<any>(this.baseUrl + 'profile', body);
  }

  public getProfiles(){
    return this.http.get(this.baseUrl + 'Profile/user').pipe(
        map((res: any) => {
          return res.Result.map((data:any) => new UserProfile(data));
      })
    );
  }

  public getMemberProfileById(id:string){
  return this.http.get(this.baseUrl + `Profile/${id}`).pipe(
        map((res: any) => {
          return new UserProfile(res.Result);
      })
    );
  }



   public updateMemberProfile(id:string, body:any){
    return this.http.put<any>(this.baseUrl + `profile/${id}`, body);
  }

  public deleteMember(id:string) {
    return this.http.delete<any>(this.baseUrl + `Profile/${id}`);
  }

  public getMatchingData(body: any, id: string, pageNumber:number, pageSize:number) {
    return this.http.post(`${this.baseUrl}ProfileMatching/matching/${id}?&pageNumber=${pageNumber}&pageSize=${pageSize}`, body).pipe(
      map((res: any) => {
        return new CommonResponse<MemberProfile>(res.Result, MemberProfile);
      })
    );
  }

  public GetFilterMemberViewData(id:string){
    let profileId = localStorage.getItem('currentMemberId');
    return this.http.get(this.baseUrl + `ProfileMatching/view/${id}?requestProfileId=${profileId}`).pipe(
        map((res: any) => {
          return new FullUserProfile(res.Result);
      })
    );
  }

  public getMainUser(){
    return this.http.get(this.baseUrl + 'User').pipe(
        map((res: any) => {
          return new MainUser(res.Result);
      })
    );
  }

  //ADD FRIEND
  public addFriendRequest(receiverId:string){
    let profileId = localStorage.getItem('currentMemberId');
    return this.http.post(this.baseUrl + `FriendRequest/send?senderId=${profileId}&receiverId=${receiverId}`,{}).pipe(
        map((res: any) => {
          return res.Result;
      })
    );
  }

  //ACCEPT FRIEND REQUEST
  public acceptFriendRequest(memberId:string){
    return this.http.post(this.baseUrl + `FriendRequest/accept/${memberId}`,{}).pipe(
          map((res: any) => {
            return res.Result;
        })
      );
  }

  //REJECT FD REQUEST
  public rejectFriendRequest(requestId:string){
      return this.http.post(this.baseUrl + `FriendRequest/reject/${requestId}`,{}).pipe(
        map((res: any) => {
          return res.Result;
      })
    );
  }

  //CANCEL REQUEST
  public cancelRequest(requestId:string){
    return this.http.post(this.baseUrl + `FriendRequest/cancel/${requestId}`,{}).pipe(
        map((res: any) => {
          return res.Result;
      })
    );
  }

  public GetFriends(){
      let profileId = localStorage.getItem('currentMemberId');
      return this.http.get(this.baseUrl + `FriendRequest/friends/${profileId}`).pipe(
          map((res: any) => {
            return res.Result;
        })
      );
    }

  public GetFriendRequests(pageNumber:number, pageSize:number){
    let profileId = localStorage.getItem('currentMemberId');
    return this.http.get(this.baseUrl + `FriendRequest/pending-requests/${profileId}?pageNumber=${pageNumber}&pageSize=${pageSize}`).pipe(
        map((res: any) => {
          return new CommonResponse<RequestList>(res.Result, RequestList);
      })
    );
  }

  public GetNotification(pageNumber: number, pageSize: number, isRead: boolean | null) {
    const profileId = localStorage.getItem('currentMemberId');
    let params = `pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (isRead !== null) {
      params = `isRead=${isRead}&` + params;
    }
    const url = `${this.baseUrl}Notification/profile/${profileId}?${params}`;
    return this.http.get(url).pipe(
      map((res: any) => {
        return new CommonNotificationResponse<NotificationItem>(res.Result, NotificationItem);
      })
    );
  }

  public MakeAsReadNotification(notificationId:string){
    let profileId = localStorage.getItem('currentMemberId');
    return this.http.put<any>(this.baseUrl + `Notification/read/${profileId}?notificationId=${notificationId}`, {});
  }

  public MakeAsReadAllNotification(){
    let profileId = localStorage.getItem('currentMemberId');
    return this.http.put<any>(this.baseUrl + `Notification/read/${profileId}`, {});
  }

  public editMainUser(body:any){
    return this.http.put<any>(this.baseUrl + `User`, body)
  }

  public setInitialLoading(load:boolean){
    this.isInitialLoad.set(load);
  }

  public sendContactUsMessage(body: any) {
  return this.http.post<any>(this.baseUrl + 'Notification/contact-us', body);
}

}
