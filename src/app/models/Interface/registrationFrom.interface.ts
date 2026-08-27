export interface UserBasicForm {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  maritalStatus: string;
  height: number;
  weight: number;
  profilesImg:any;
}

export interface UserContactForm {
  email: string;
  phoneNumber: string;
  city: string;
  stateProvince: string;
  convenientTimeToCall: string;
  country: string;
  address: string;
  residencyStatus: number;
  addressType: 'permanent' | 'temporary' | string;

}

export interface PersonalDetails {
  aboutMe: string;
  disability: string;
  motherTongue: number;
  diet: number;
  smoking: number;
  drinking: number;
  languages: any;
  bodyType:number,
  canReLocated: boolean;
  bloodGroup:number;
  complexion:number;
}
export interface UserFamilyInfo {
  fatherName: string;
  motherName: string;
  fatherOccupation: string;
  matherOccupation: string;
  siblings: number;
  familyType: number;
  originCountry:string;
}

export interface UserReligiousInfo {
  religion: string ;
  communityCast: string;
  timeOfBirth: string;
  isVisible : boolean;
  starNakshathra: number;
  raasi: number;
  chevvaiDosham: number;
  horoscopeMatching: number;
  address:any;
}

export interface UserEducationDetails{
  highestEducation: string;
  qualification: string;
  institute: string;
  jobTitle: string;
  companyName: string;
  sector: number;
  jobType: string | null;
  salaryDetails: string;
  currency: string | null;
  isYearly: boolean;
  isVisible:boolean;
}

export interface MatchPreferences {
  profileFor: number;
  gender: number;
  minAge: number;
  maxAge: number;
  country: string;
}


