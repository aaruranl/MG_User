export interface SocialLogin {
  AccessToken:string,
  IDToken:string,
  isError:boolean,
}

export class SocialFirebaseResponse {
  socialToken:string;
  accessToken: string;
  name:string;
  email: string;
  socialClientId:string;
  isNameAvailable:boolean;
  firstName:String;
  lastName:string;
  constructor(obj:any){
    this.socialToken = obj.credential.idToken ?? '';
    this.accessToken = obj.credential.accessToken ?? '';
    this.name = obj.additionalUserInfo.profile.name ?? '';
    this.email = obj.additionalUserInfo.profile.email ?? '';
    this.socialClientId = obj.additionalUserInfo.profile.id ?? '';
    this.isNameAvailable = obj.additionalUserInfo.profile.name ?? false;
    this.firstName = obj.additionalUserInfo.profile.family_name ?? obj.additionalUserInfo.profile.first_name;
    this.lastName = obj.additionalUserInfo.profile.given_name ?? obj.additionalUserInfo.profile.last_name;

  }
}
