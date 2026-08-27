import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TokenResult } from '../../../models/clientToken.model';
import { MainUser } from '../../../models/index.model';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = (environment as any).baseUrl;

  private memberSubject$ = new BehaviorSubject<any>(null);
  member$ = this.memberSubject$.asObservable();

  private _authStatus = new BehaviorSubject<boolean>(this.isLoggedIn());
  public authStatus = this._authStatus.asObservable();

  private memberListSubject$ = new BehaviorSubject<any>(null);
  memberList$ = this.memberListSubject$.asObservable();

  private mainUserSubject$ = new BehaviorSubject<MainUser | null>(null);
  mainUser$ = this.mainUserSubject$.asObservable();

  public isActiveSubscription$ = new BehaviorSubject<boolean | null>(null);


  constructor(private http: HttpClient) { }

  public googleLogin(token: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/google-login`, { token });
  }

  // GET CLIENT TOKEN
  public getLoginClientToken(clientData:any){
    return this.http.get(this.baseUrl + `Client/client-token?name=${clientData.name}&secretKey=${clientData.secretKey}`).pipe(
      map((res: any) => {
        return new TokenResult(res.Result);
      })
    );
  }

  //SING UP
  public signUp(body:any, clientToken:any){
    const headers = this._getHeader(clientToken);
    return this.http.post<any>(this.baseUrl + 'Auth/register', body, { 'headers': headers });
  }

  //LOGIN
  public login(body:any,clientToken:string){
    const headers = this._getHeader(clientToken);
    return this.http.post<any>(this.baseUrl + 'Auth/login', body, { 'headers': headers });
  }

  //FORGOT PASSWORD
  public forgotPassword(isEmail:boolean,clientToken:string,param:string){
    const headers = this._getHeader(clientToken);
    return this.http.get(this.baseUrl + `Password/forgot-password?${isEmail ? 'email' : 'phoneNumber'}=${param}`,{ 'headers': headers }).pipe(
      map((res: any) => {
        return new TokenResult(res.Result);
      })
    );
  }

  //OTP VERIFICATION
  public verifyOtp(body:any,clientToken:string){
    const headers = this._getHeader(clientToken);
    return this.http.post<any>(this.baseUrl + 'Password/otp-verification', body, { 'headers': headers });
  }

  //EMAIL VERIFICATION
  public emailVerification(body:any,clientToken:string){
    const headers = this._getHeader(clientToken);
    return this.http.post<any>(this.baseUrl + 'Auth/email/verification', body, { 'headers': headers });
  }

  //CREATE PASSWORD
  public createPassword(body: any, clientToken: string): Observable<any> {
    const headers = this._getHeader(clientToken);
    return this.http.post<any>(`${this.baseUrl}Password/reset-password`, body, { headers })
      .pipe(
        catchError(error => {
        console.error('Error resetting password:', error);
        return throwError(() => error);
      })
    );
  }

  public socialLogin(body: any, clientToken: string){
    const headers = this._getHeader(clientToken);
    return this.http.post<any>(`${this.baseUrl}Auth/social-login`, body, { headers })
      .pipe(
        catchError(error => {
        console.error('Error resetting password:', error);
        return throwError(() => error);
      })
    );
  }
  //HEDER
  private _getHeader(clientToken:string){
    const headers = new HttpHeaders()
    .set('content-type', 'application/json')
    .set('Access-Control-Allow-Origin', '*')
    .set('Authorization', `Bearer ${clientToken}`);
    return headers;
  }

  public setAuthToken(token: string) {
    localStorage.setItem('token', token);
    this._authStatus.next(true);
  }

  public getAuthToken() {
    return localStorage.getItem('token');
  }

  public removeAuthToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    this._authStatus.next(false);
  }

  public setUser(){
    var userDetails = this.getTokenDecodeData()
    localStorage.setItem('userType', userDetails.UserType);

  }

  public getUserType(){
    var userDetails = this.getTokenDecodeData()
    return userDetails.UserType;
  }

  public isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  public getTokenDecodeData() {
    const token: any = localStorage.getItem('token');
    let decodeToken = this.payload(token);
    if(decodeToken['UserType'] === 'Member') {
      decodeToken['LoginUserType'] = 'Member';
    } else if (decodeToken['UserType'] === 'Agent') {
      decodeToken['LoginUserType'] = 'Agent';
    } else {
      decodeToken['LoginUserType'] = 'Admin';
    }
    return decodeToken;
  }

  public payload(token: string) {
    const payload = token.split('.')[1];
    return this.decode(payload);
  }

  public decode(payload: string) {
    return JSON.parse(atob(payload));
  }

  public setUserDetails(userDetails:any){
    this.memberSubject$.next(userDetails);
  }

  public setMemberList(memberList:any){
    this.memberListSubject$.next(memberList);
  }


  public setMainUser(userDetails:any){
    this.mainUserSubject$.next(userDetails);
  }

  public setActiveSubscription(isActiveSubscription: boolean) {
    this.isActiveSubscription$.next(isActiveSubscription);
  }

  public changePassword(body:any){
     return this.http.post<any>(`${this.baseUrl}Password/change-password`, body );
  }

  public deleteAccount(){
    return this.http.delete<any>(this.baseUrl + 'User');
  }

}
