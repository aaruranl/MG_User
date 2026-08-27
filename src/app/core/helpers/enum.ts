export enum ResetPasswordStep {
  login = 0,
  enterEmail = 1,
  verification = 2,
  resetPassword = 3
}

export enum LoginType
{
  Email = 1,
  PhoneNumber = 2,
  Google = 3,
  Facebook = 4
}

export enum TokenType
{
    ClientToken = 1,
    LoginToken = 2,
    ForgotPasswordToken = 3,
    ResetPasswordToken = 4,
    UserVerificationToken = 5,
}

export enum MemberRegistrationStep {
  lookingFor = 0,
  basic = 1,
  contact = 2,
  personal = 3,
  family = 4,
  religionBackground = 5,
  education = 6,
  complete = 7,
}

export enum AddressType {
 // permanent = 2,
  //temporary = 1,
  living = 1,
  birth = 2
}

export enum FileType {
  Text = 1,
  Image = 2,
  Document = 3,
}

export enum FriendRequestStatus
{
    Pending = 1,
    Accepted = 2,
    Rejected = 3
}

export enum NotificationType
{
  WelcomeMember = 1,
  ForgotPasswordOtp = 2,
  EmailVerificationOtp = 3,
  FriendRequestAccept = 4,
  FriendRequestReject = 5,
}


export enum SubscriptionType
{
    Free = 1,
    Silver = 2,
    Gold = 3,
    Platinum = 4
}
export enum BillingInterval
{
    Day = 1,
    Week = 2,
    Month = 3,
    Year = 4
}

export enum SubscriptionStatus
{
    none = 0,
    Active = 1,
    Trialing = 2,
    Canceled = 3,
    Incomplete = 4,
    IncompleteExpired = 5,
    PastDue = 6,
    Unpaid = 7
}

export enum MemberApproval
{
    Pending = 1,
    Approved = 2,
    Rejected = 3
}

export enum ContentStatus {
  Published = 1,
  Draft = 2,
  Archived = 3
}
