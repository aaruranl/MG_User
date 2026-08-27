export class User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  image: string | null;
  userType: number;
  isPasswordReset: boolean;
  currentSubscriptionType: number;
  subscriptionStatus: string | null;
  memberCount: number;
  remainingMemberCount: number;
  userProfiles:userMember[];

  constructor(obj: any) {
    this.id = obj?.id ?? '';
    this.firstName = obj?.firstName ?? '';
    this.lastName = obj?.lastName ?? '';
    this.email = obj?.email ?? '';
    this.phoneNumber = obj?.phoneNumber ?? '';
    this.image = obj?.image ?? 'https://cdn-icons-png.flaticon.com/512/9187/9187604.png';
    this.userType = obj?.userType ?? 0;
    this.isPasswordReset = obj?.isPasswordReset ?? false;
    this.currentSubscriptionType = obj?.currentSubscriptionType ?? 0;
    this.subscriptionStatus = obj?.subscriptionStatus ?? null;
    this.memberCount = obj?.memberCount ?? 0;
    this.remainingMemberCount = obj?.remainingMemberCount ?? 0;
    this.userProfiles = obj.userProfiles ? obj.userProfiles.map((user:any) => new userMember(user) ) : [];

  }
}

export class userMember {
  id:string;
  firstName: string;
  lastName: string;
  memberApproval:number;

  constructor(obj:any){
    this.id = obj?.id ?? '';
    this.firstName = obj?.firstName ?? '';
    this.lastName = obj?.lastName ?? '';
    this.memberApproval = obj.memberApproval ?? 0;
  }
}
