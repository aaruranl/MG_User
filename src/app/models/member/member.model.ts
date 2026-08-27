import { BloodGroup, bodyTypes, Complexion, diet, DrinkHabit, maritalStatusOptions, Natshathira, raasiList, SmokeHabit, willingToRelocate } from "../../helpers/data";
import { SubscriptionStatus } from "../../helpers/enum";
import { getFormattedDateAndTime } from "../../helpers/Functions/timeConverter";

export class ProfileSalary {
  isAnnual: boolean;
  amount: number;
  currencyCode: string;
  isVisible: boolean;

  constructor(obj: any = {}) {
    this.isAnnual = obj?.isAnnual ?? false;
    this.amount = obj?.amount ?? 0;
    this.currencyCode = obj?.currencyCode ?? '';
    this.isVisible = obj?.isVisible ?? false;
  }
}

export class ProfileJob {
  id: string;
  title: string;
  companyName: string;
  sector: number;
  jobTypeId: string;
  profileSalary: ProfileSalary;

  constructor(obj: any = {}) {
    this.id = obj?.id ?? '';
    this.title = obj?.title ?? '';
    this.companyName = obj?.companyName ?? '';
    this.sector = obj?.sector ?? 0;
    this.jobTypeId = obj?.jobTypeId ?? '';
    this.profileSalary = new ProfileSalary(obj?.profileSalary);
  }
}

export class ProfileLookingFor {
  id: string;
  gender: number;
  minAge: number;
  maxAge: number;
  country: string;

  constructor(obj: any = {}) {
    this.id = obj?.id ?? '';
    this.gender = obj?.gender ?? 0;
    this.minAge = obj?.minAge ?? 0;
    this.maxAge = obj?.maxAge ?? 0;
    this.country = obj?.country ?? '';
  }
}

export class ProfileFamily {
  id: string;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  numberOfSiblings: number;
  familyType: number;

  constructor(obj: any = {}) {
    this.id = obj?.id ?? '';
    this.fatherName = obj?.fatherName ?? '';
    this.fatherOccupation = obj?.fatherOccupation ?? '';
    this.motherName = obj?.motherName ?? '';
    this.motherOccupation = obj?.motherOccupation ?? '';
    this.numberOfSiblings = obj?.numberOfSiblings ?? 0;
    this.familyType = obj?.familyType ?? 0;
  }
}

export class ProfileAstrology {
  id: string;
  nakshathiram: number;
  raasi: number;
  timeOfBirth: string | null;
  starName: string | null;
  rasiName: string | null;

  constructor(obj: any = {}) {
    this.id = obj?.id ?? '';
    this.nakshathiram = obj?.nakshathiram ?? 0;
    this.raasi = obj?.raasi ?? 0;
    this.timeOfBirth = obj?.timeOfBirth ?? null;
    this.starName = obj?.nakshathiram ? getNatshathira(obj?.nakshathiram) : null;
    this.rasiName = obj?.raasi ? getRasi(obj?.raasi) : null;
  }
}

export class ProfileImage {
  id?: string;
  url: string;
  isProfile?: boolean;
  isVisible: boolean;
  constructor(obj: any = {}) {
    this.id = obj?.id;
    this.url = obj?.url ?? '';
    this.isProfile = obj?.isProfile ?? false;
    this.isVisible = obj?.isVisible ?? false;

  }
}

export class ProfileAddress {
  id?: string;
  addressType: number;
  residentStatus?: number | null;
  isDefault: boolean;
  number?: string | null;
  street: string;
  city: string;
  state: string;
  zipcode?: string | null;
  country: string;
  latitude: number;
  longitude: number;

  constructor(obj: any = {}) {
    this.id = obj?.id;
    this.addressType = obj?.addressType ?? 0;
    this.residentStatus = obj?.residentStatus;
    this.isDefault = obj?.isDefault ?? false;
    this.number = obj?.number;
    this.street = obj?.street ?? '';
    this.city = obj?.city ?? '';
    this.state = obj?.state ?? '';
    this.zipcode = obj?.zipcode;
    this.country = obj?.country ?? '';
    this.latitude = obj?.latitude ?? 0;
    this.longitude = obj?.longitude ?? 0;
  }
}

export class ProfileEducation {
  id?: string;
  qualification: string;
  institute: string;
  sortNo: number;
  educationQualificationId: string;

  constructor(obj: any = {}) {
    this.id = obj?.id;
    this.qualification = obj?.qualification ?? '';
    this.institute = obj?.institute ?? '';
    this.sortNo = obj?.sortNo ?? 0;
    this.educationQualificationId = obj?.educationQualificationId ?? '';
  }
}

export class UserProfile {
  id: string;
  profileFor: number;
  isActive: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  aboutMe: string;
  gender: number;
  dateOfBirth: string;
  foodHabit: number;
  drinksHabit: number;
  smokeHabit: number;
  marriageStatus: number;
  bodyType: number;
  willingToRelocate: number;
  height: number;
  weight: number;
  disability: string;
  originCountry: string;
  motherTongue: string;
  knownLanguages: string | null;
  bloodGroup: number;
  skinComplexion: number;
  isVisibleCommunity: boolean;
  userId: string;
  religionId: string;
  communityId: string | null;
  subCommunityId: string | null;
  profileJob: ProfileJob | null;
  profileLookingFor: ProfileLookingFor;
  profileFamily: ProfileFamily;
  profileAstrology: ProfileAstrology;
  profileImages: ProfileImage[];
  profileAddresses: ProfileAddress[];
  profileEducations: ProfileEducation[];
  phoneCode: string;
  age: number;
  memberApproval: number;
  isVisiblePhoneNumber: boolean;
  religionName: string;
  communityName: string;

  constructor(obj: any = {}) {
    const images = obj?.profileImages ?? [];
    this.id = obj?.id ?? '';
    this.profileFor = obj?.profileFor ?? 0;
    this.isActive = obj?.isActive ?? false;
    this.firstName = obj?.firstName ?? '';
    this.lastName = obj?.lastName ?? '';
    this.email = obj?.email ?? '';
    this.phoneNumber = obj?.phoneNumber ?? '';
    this.aboutMe = obj?.aboutMe ?? '';
    this.gender = obj?.gender ?? 0;
    this.dateOfBirth = obj?.dateOfBirth ?? '';
    this.foodHabit = obj?.foodHabit ?? 0;
    this.drinksHabit = obj?.drinksHabit ?? 0;
    this.smokeHabit = obj?.smokeHabit ?? 0;
    this.marriageStatus = obj?.marriageStatus ?? 0;
    this.bodyType = obj?.bodyType ?? 0;
    this.willingToRelocate = obj?.willingToRelocate ?? 0;
    this.height = obj?.height ?? 0;
    this.weight = obj?.weight ?? 0;
    this.disability = obj?.disability ?? '';
    this.originCountry = obj?.originCountry ?? '';
    this.motherTongue = obj?.motherTongue ?? '';
    this.knownLanguages = obj?.knownLanguages ?? null;
    this.bloodGroup = obj?.bloodGroup ?? 0;
    this.skinComplexion = obj?.skinComplexion ?? 0;
    this.isVisibleCommunity = obj?.isVisibleCommunity ?? false;
    this.userId = obj?.userId ?? '';
    this.religionId = obj?.religionId ?? '';
    this.communityId = obj?.communityId ?? null;
    this.subCommunityId = obj?.subCommunityId ?? null;
    this.profileJob = obj?.profileJob ? new ProfileJob(obj?.profileJob) : null;
    this.profileLookingFor = new ProfileLookingFor(obj?.profileLookingFor);
    this.profileFamily = new ProfileFamily(obj?.profileFamily);
    this.profileAstrology = new ProfileAstrology(obj?.profileAstrology);
    // this.profileImages = (obj?.profileImages ?? []).map((i: any) => new ProfileImage(i));
    this.profileImages = images.length > 0
      ? images.map((i: any) => new ProfileImage(i))
      : [new ProfileImage({ url: 'https://dev1mg.blob.core.windows.net/temp/mgate/indian-groom-wearing-traditional-wedding-sherwani-turban-vector-illustration-gold-red-feather-detail-depicting-381238297.webp-446f2768-f5af-417f-9d39-17fa69ce3636?sv=2025-05-05&se=2025-07-01T10%3A28%3A51Z&sr=b&sp=rd&sig=bm5avHwTVMc%2BHiFNjDG4Y3XdOqFmboMPeuQqhYOqAtw%3D' })];
    this.profileAddresses = (obj?.profileAddresses ?? []).map((a: any) => new ProfileAddress(a));
    this.profileEducations = (obj?.profileEducations ?? []).map((e: any) => new ProfileEducation(e));
    this.phoneCode = obj.phoneCode ?? '';
    this.age = obj.age ?? 0;
    this.memberApproval = obj.memberApproval ?? 0;
    this.isVisiblePhoneNumber = obj?.isVisiblePhoneNumber ?? true;
    this.religionName = obj?.religionNameString ?? obj?.religion ?? '';
    this.communityName = obj?.communityNameString ?? obj?.community ?? null;
  }
}
export class MainUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  image: string;
  isActiveSubscription: boolean;
  userType: number;
  isPasswordReset: boolean;
  subscriptionType: number;
  subscriptionStatus: number;
  memberCount: number;
  remainingMemberCount: number;
  phoneCode?: string;

  constructor(obj: any) {
    this.id = obj?.id ?? null;
    this.firstName = obj?.firstName ?? null;
    this.lastName = obj?.lastName ?? null;
    this.email = obj?.email ?? null;
    this.phoneNumber = obj?.phoneNumber ?? null;
    this.image = obj?.image ?? 'https://cdn-icons-png.flaticon.com/512/9187/9187604.png';
    this.isActiveSubscription = (obj?.subscriptionStatus === SubscriptionStatus.Active || obj?.subscriptionStatus === SubscriptionStatus.Trialing) ? true : false;
    this.userType = obj.userType ?? 0;
    this.isPasswordReset = obj.isPasswordReset ?? false;
    this.subscriptionType = obj.currentSubscriptionType ?? null;
    this.subscriptionStatus = obj.subscriptionStatus ?? 0;
    this.memberCount = obj.memberCount ?? 0;
    this.remainingMemberCount = obj.remainingMemberCount ?? 0;
    this.phoneCode = obj.phoneCode ?? 'CH';
  }
}

export class LivingAddress {
  id: string;
  addressType: number;
  residentStatus: number;
  isDefault: boolean;
  number: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  latitude: number;
  longitude: number;

  constructor(obj: any) {
    this.id = obj?.id ?? null;
    this.addressType = obj?.addressType ?? null;
    this.residentStatus = obj?.residentStatus ?? null;
    this.isDefault = obj?.isDefault ?? false;
    this.number = obj?.number ?? '';
    this.street = obj?.street ?? '';
    this.city = obj?.city ?? '';
    this.state = obj?.state ?? '';
    this.zipcode = obj?.zipcode ?? '';
    this.country = obj?.country ?? '';
    this.latitude = obj?.latitude ?? 0;
    this.longitude = obj?.longitude ?? 0;
  }
}

export class MemberProfile {
  id: string;
  firstName: string;
  lastName: string;
  gender: number;
  dateOfBirth: string;
  age: number;
  religion: string;
  jobTitle: string;
  imageUrl: string;
  livingAddresses: LivingAddress | null;

  constructor(obj: any) {
    this.id = obj?.id ?? null;
    this.firstName = obj?.firstName ?? '';
    this.lastName = obj?.lastName ?? '';
    this.gender = obj?.gender ?? null;
    this.dateOfBirth = obj?.dateOfBirth ?? null;
    this.age = obj?.age ?? null;
    this.religion = obj?.religion ?? '';
    this.jobTitle = obj?.jobTitle ?? null;
    // this.imageUrl = obj?.imageUrl ? obj?.imageUrl : obj?.gender === 1 ?'https://dev1mg.blob.core.windows.net/mgate/common/Groom.jpg' : 'https://dev1mg.blob.core.windows.net/mgate/common/Bride.jpg';
    this.imageUrl = obj?.imageUrl ?? ';'
    this.livingAddresses = obj.livingAddresses ? new LivingAddress(obj.livingAddresses) : null;
  }
}


export class FullUserProfile {

  id: string;
  isActive: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  phoneCode: string;
  aboutMe: string;
  gender: string | null;
  dateOfBirth: string;
  foodHabit: string | null;
  drinksHabit: string | null;
  smokeHabit: string | null;
  marriageStatus: string | null;
  bodyType: string | null;
  willingToRelocate: string | null;
  height: number;
  weight: number;
  disability: string;
  originCountry: string;
  motherTongue: string;
  knownLanguages: string;
  bloodGroup: string | null;
  skinComplexion: string;
  religionId: string;
  communityId: string;
  subCommunityId: string;
  communityName: string;
  profileJob: ProfileJob | null;
  profileLookingFor: ProfileLookingFor | null;
  profileFamily: ProfileFamily | null;
  profileAstrology: ProfileAstrology | null;
  profileImages: ProfileImage[];
  profileAddresses: ProfileAddress[];
  profileEducations: ProfileEducation[];
  age: number;
  friendRequest: Request | null;
  manageBy: string;
  profileImage: string | null;
  religionName: string;

  constructor(obj: any) {
    const images = obj?.profileImages ?? [];
    this.id = obj?.id ?? null;
    this.isActive = obj?.isActive ?? false;
    this.firstName = obj?.firstName ?? '';
    this.lastName = obj?.lastName ?? '';
    this.email = obj?.email ?? '';
    this.phoneNumber = obj?.phoneNumber ?? '';
    this.phoneCode = obj?.phoneCode ?? '';
    this.aboutMe = obj?.aboutMe ?? '';
    this.gender = obj?.gender ? (obj?.gender == 1 ? 'Male' : 'Female') : null;
    this.dateOfBirth = obj?.dateOfBirth ?? '';
    this.foodHabit = getFoodHabit(obj?.foodHabit) ?? null;
    this.drinksHabit = getDrinkingHabit(obj?.drinksHabit) ?? null;
    this.smokeHabit = getSmokeHabit(obj?.smokeHabit) ?? null;
    this.marriageStatus = getMarriedStatus(obj?.marriageStatus) ?? null;
    this.bodyType = getBodyType(obj?.bodyType) ?? null;
    this.willingToRelocate = getRelocated(obj?.willingToRelocate) ?? null;
    this.height = obj?.height ?? null;
    this.weight = obj?.weight ?? null;
    this.disability = obj?.disability ?? '';
    this.originCountry = obj?.originCountry ?? '';
    this.motherTongue = obj?.motherTongue ?? '';
    this.knownLanguages = obj?.knownLanguages ?? '';
    this.bloodGroup = getBloodGroup(obj?.bloodGroup) ?? null;
    this.skinComplexion = getSkinCompletion(obj?.skinComplexion) ?? '';
    this.religionId = obj?.religionId ?? null;
    this.communityId = obj?.communityId ?? null;
    this.subCommunityId = obj?.subCommunityId ?? null;
    this.communityName =  obj?.communityName ?? obj?.community ?? null;
    this.profileJob = obj?.profileJob ? new ProfileJob(obj.profileJob) : null;
    this.profileLookingFor = obj?.profileLookingFor ? new ProfileLookingFor(obj.profileLookingFor) : null;
    this.profileFamily = obj?.profileFamily ? new ProfileFamily(obj.profileFamily) : null;
    this.profileAstrology = obj?.profileAstrology ? new ProfileAstrology(obj.profileAstrology) : null;
    this.profileImages = obj?.profileImages?.map((x: any) => new ProfileImage(x)) ?? [];
    //   this.profileImages = images.length > 0 ? images.map((i: any) => new ProfileImage(i)) : [new ProfileImage({ url: 'https://dev1mg.blob.core.windows.net/mgate/common/Groom.jpg', isVisible:false })];
    this.profileImages = images.length > 0 ? images.map((i: any) => new ProfileImage(i)) : [];
    this.profileAddresses = obj?.profileAddresses?.map((x: any) => new ProfileAddress(x)) ?? [];
    this.profileEducations = obj?.profileEducations?.map((x: any) => new ProfileEducation(x)) ?? [];
    this.age = obj?.age ?? 0;
    this.friendRequest = obj.friendRequest !== null && obj.friendRequest ? new Request(obj.friendRequest) : null;
    this.manageBy = obj.manageBy ?? '';
    this.profileImage = obj.profileImages?.find((p: ProfileImage) => p.isProfile)?.url ?? null;
    this.religionName = obj?.religionName ?? obj?.religion ?? '';



  }






}

export class Request {
  id: string | null;
  receiverProfileId: string | null;
  requestedAt: string;
  respondedAt: string;
  senderProfileId: string | null;
  status: number | null;

  constructor(obj: any) {
    this.id = obj.id ?? null;
    this.receiverProfileId = obj.receiverProfileId ?? null,
      this.requestedAt = obj.requestedAt ?? '';
    this.respondedAt = obj.respondedAt ?? '';
    this.senderProfileId = obj.senderProfileId ?? '';
    this.status = obj.status ?? null;
  }
}

export class RequestList {
  id: string | null;
  name: string | null;
  profileImageURL: string | null;
  senderProfileId: string | null;
  receiverProfileId: string | null;
  status: number | null;
  requestedAt: string;
  respondedAt: string;

  constructor(obj: any) {
    this.id = obj.id ?? null;
    this.name = obj.name ?? null;
    this.profileImageURL = obj.profileImageURL ?? null;
    this.senderProfileId = obj.senderProfileId ?? null;
    this.receiverProfileId = obj.receiverProfileId ?? null;
    this.status = obj.status ?? null;
    this.requestedAt = obj.requestedAt ?? '';
    this.respondedAt = obj.respondedAt ?? '';
  }
}

export class NotificationItem {
  id: string;
  title: string | null;
  body: string | null;
  payload: any;
  parsedPayload: { ProfileId: string; ImageUrl: string } | null;
  notificationType: number | null;
  receivedProfileId: string | null;
  receivedUserId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdDate: string;

  constructor(obj: any) {
    this.id = obj.id ?? null;
    this.title = obj.title ?? null;
    this.body = obj.body ?? null;
    this.payload = obj.payload ?? null;

    try {
      this.parsedPayload =
        typeof this.payload === 'string'
          ? JSON.parse(this.payload)
          : this.payload;
    } catch {
      this.parsedPayload = null;
    }

    this.notificationType = obj.notificationType ?? null;
    this.receivedProfileId = obj.receivedProfileId ?? null;
    this.receivedUserId = obj.receivedUserId ?? null;
    this.isRead = obj.isRead ?? false;
    this.readAt = obj.readAt ?? null;
    this.createdDate = getFormattedDateAndTime(obj.createdDate) ?? '';
  }
}

export function getNatshathira(status: number) {
  const option = Natshathira.find(opt => opt.id === status);
  return option ? option.name : null;
}

export function getRasi(status: number) {
  const option = raasiList.find(opt => opt.id === status);
  return option ? option.name : null;
}


export function getMarriedStatus(status: number) {
  const option = maritalStatusOptions.find(opt => opt.id === status);
  return option ? option.name : null;
}

export function getFoodHabit(status: number) {
  const option = diet.find(opt => opt.id === status);
  return option ? option.name : null;
}

export function getRelocated(status: number) {
  const option = willingToRelocate.find(opt => opt.id === status);
  return option ? option.name : null;
}

export function getBloodGroup(status: number) {
  const option = BloodGroup.find(opt => opt.id === status);
  return option ? option.name : null;
}

export function getBodyType(status: number) {
  const option = bodyTypes.find(opt => opt.id === status);
  return option ? option.name : null;
}

export function getSmokeHabit(status: number) {
  const option = SmokeHabit.find(opt => opt.id === status);
  return option ? option.name : null;
}

export function getDrinkingHabit(status: number) {
  const option = DrinkHabit.find(opt => opt.id === status);
  return option ? option.name : null;
}

export function getSkinCompletion(status: number) {
  const option = Complexion.find(opt => opt.id === status);
  return option ? option.name : null;
}
