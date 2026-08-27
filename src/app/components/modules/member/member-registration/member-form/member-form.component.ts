import { MemberApproval } from './../../../../../helpers/enum';
import { AuthService } from './../../../../../core/services/auth/auth.service';
import { MemberService } from '../../../../../core/services/member.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MemberProfileFormComponent } from "./member-profile-form/member-profile-form.component";
import { MainUser, MatchPreferences, PersonalDetails, UserBasicForm, UserContactForm, UserDetails, UserEducationDetails, UserFamilyInfo, UserProfile, UserReligiousInfo } from '../../../../../models/index.model';
import { ActivatedRoute, Router } from '@angular/router';
import { COMMON_DIRECTIVES } from '../../../../../common/common-imports';
import { MemberRegistrationStep } from '../../../../../helpers/enum';
import { ContactInfoFormComponent } from "./contact-info-form/contact-info-form.component";
import { PersonalDetailsFormComponent } from "./personal-details-form/personal-details-form.component";
import { FamilyInformationFormComponent } from "./family-information-form/family-information-form.component";
import { ReligiousBackgroundFormComponent } from "./religious-background-form/religious-background-form.component";
import { EducationDetailsFormComponent } from "./education-details-form/education-details-form.component";
import { LookingForFormComponent } from "./looking-for-form/looking-for-form.component";
import { ToastrService } from 'ngx-toastr';
import { LoadingComponent } from "../../../../../common/loading/loading.component";
import { TopBarComponent } from "../../../../../common/top-bar/top-bar.component";

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [
    MemberProfileFormComponent,
    COMMON_DIRECTIVES,
    ContactInfoFormComponent,
    PersonalDetailsFormComponent,
    FamilyInformationFormComponent,
    ReligiousBackgroundFormComponent,
    EducationDetailsFormComponent,
    LookingForFormComponent,
    LoadingComponent,
    TopBarComponent
  ],
  templateUrl: './member-form.component.html',
  styleUrl: './member-form.component.scss'
})
export class MemberFormComponent implements OnInit {
  @Input() memberIdInput: string = '';
  @Output() goBackEmitter = new EventEmitter<boolean>();

  public isEditMode: boolean = false;
  public memberId: string = '';
  public memberProfile!: UserProfile;

  public questionData: any;
  public currentStep: number = 0;
  public steps = MemberRegistrationStep;

  public matchingInfo!: MatchPreferences;
  public userBasicDetails!: UserBasicForm;
  public userContactDetails!: any;
  public userPersonalDetails!: PersonalDetails;
  public userFamilyDetails!: UserFamilyInfo;
  public userEducationDetails!: UserEducationDetails;
  public UserReligiousDetails!: UserReligiousInfo;

  public userDetails!: UserDetails;
  public userAddressList: any[] = [];
  public isLoading: boolean = false;

  public isEditFlow: boolean = true;
  public mainUser!: MainUser;
  public isHideGender: boolean = false;

  public stepList = [
    { key: this.steps.lookingFor, label: 'Matching Preferences', desc: 'Partner expectations & age', icon: 'fa-heart' },
    { key: this.steps.basic, label: 'Personal Information', desc: 'Name, DOB, height, photos', icon: 'fa-id-card' },
    { key: this.steps.contact, label: 'Contact Details', desc: 'Email, phone & address', icon: 'fa-phone-alt' },
    { key: this.steps.personal, label: 'Lifestyle & Habits', desc: 'Diet, mother tongue & habits', icon: 'fa-heart-pulse' },
    { key: this.steps.family, label: 'Family Information', desc: 'Parents & family values', icon: 'fa-users' },
    { key: this.steps.religionBackground, label: 'Religious Background', desc: 'Religion, caste & horoscope', icon: 'fa-om' },
    { key: this.steps.education, label: 'Education & Career', desc: 'Degrees, profession & salary', icon: 'fa-graduation-cap' }
  ];

  public getActiveStepIndex(): number {
    const idx = this.stepList.findIndex(s => s.key === this.currentStep);
    return idx >= 0 ? idx : 0;
  }

  public getActiveStep(): { key: number; label: string; desc: string; icon: string } {
    return this.stepList[this.getActiveStepIndex()] || this.stepList[0];
  }

  constructor(
    private route: Router,
    private activeRoute: ActivatedRoute,
    private _memberService: MemberService,
    private AuthService: AuthService,
    private toastr: ToastrService,
    private _authService: AuthService
  ) {
    this.memberId = this.activeRoute.snapshot.paramMap.get('id') || '';
  }

  ngOnInit(): void {
    if (!this.memberId && this.memberIdInput) {
      this.memberId = this.memberIdInput;
    }

    if (this.memberId) {
      this.isEditMode = true;
      this.loadMemberProfile();
    } else {
      this.isEditMode = false;
    }

    this.getMainUser();
    this.getProfileQusData();
    this.userDetails = this.AuthService.getTokenDecodeData();
  }

  public loadMemberProfile(): void {
    if (!this.memberId) return;
    this.isLoading = true;
    this._memberService.getMemberProfileById(this.memberId).subscribe({
      next: (res: any) => {
        this.memberProfile = res;
      },
      complete: () => {
        this.isLoading = false;
        if (this.memberProfile.profileFor === 1 || this.memberProfile.profileFor === 6 || this.memberProfile.profileFor === 7) {
          this.isHideGender = false;
        } else {
          this.isHideGender = true;
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.toastr.error(error.error?.Error?.Detail || 'Failed to load member profile', error.error?.Error?.Title || 'Error');
      }
    });
  }

  public refreshMemberProfile(): void {
    this.loadMemberProfile();
  }

  public changeStep(step: number): void {
    if (this.isEditMode) {
      this.loadMemberProfile();
    }
    this.currentStep = step;
    this.scrollToTop();
  }

  public getProfileQusData() {
    this.questionData = this._memberService.getQuestionData();
  }

  public getUserLookingForDetails(event: MatchPreferences) {
    this.matchingInfo = event;
    if (this.matchingInfo.profileFor === 1 || this.matchingInfo.profileFor === 6 || this.matchingInfo.profileFor === 7) {
      this.isHideGender = false;
    } else {
      this.isHideGender = true;
    }
    this.currentStep = MemberRegistrationStep.basic;
    this.scrollToTop();
  }

  public getUserBasicDetailsEmitter(event: UserBasicForm) {
    this.currentStep = MemberRegistrationStep.contact;
    this.userBasicDetails = event;
    this.scrollToTop();
  }

  public getUserContactDetailsEmitter(event: UserContactForm) {
    this.userAddressList.push(event.address[0]);
    if (event.address[1]) {
      this.userAddressList.push(event.address[1]);
    }
    this.userContactDetails = event;
    this.currentStep = MemberRegistrationStep.personal;
    this.scrollToTop();
  }

  public getUserPersonalDetailsEmitter(event: PersonalDetails) {
    this.currentStep = MemberRegistrationStep.family;
    this.userPersonalDetails = event;
    this.scrollToTop();
  }

  public getUserFamilyDetailsEmitter(event: UserFamilyInfo) {
    this.currentStep = MemberRegistrationStep.religionBackground;
    this.userFamilyDetails = event;
    this.scrollToTop();
  }

  public getUserReligiousEmitter(event: UserReligiousInfo) {
    this.UserReligiousDetails = event;
    this.userAddressList.push(this.UserReligiousDetails.address);
    this.currentStep = MemberRegistrationStep.education;
    this.scrollToTop();
  }

  public getEducationDetails(event: UserEducationDetails) {
    this.userEducationDetails = event;
    this.scrollToTop();
    this._prePareUserPostBody();
  }

  public goBack() {
    if (this.currentStep === this.steps.lookingFor) {
      this.isEditFlow ? this.route.navigateByUrl('member/profiles') : this.route.navigateByUrl('home/member');
      return;
    } else if (this.currentStep === this.steps.basic) {
      this.currentStep = this.steps.lookingFor;
    } else if (this.currentStep === this.steps.contact) {
      this.currentStep = this.steps.basic;
    } else if (this.currentStep === this.steps.personal) {
      this.currentStep = this.steps.contact;
    } else if (this.currentStep === this.steps.family) {
      this.currentStep = this.steps.personal;
    } else if (this.currentStep === this.steps.religionBackground) {
      this.currentStep = this.steps.family;
    } else if (this.currentStep === this.steps.education) {
      this.currentStep = this.steps.religionBackground;
    }
    this.scrollToTop();
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private _prePareUserPostBody() {
    const body = {
      profileFor: this.matchingInfo?.profileFor,
      isActive: true,
      firstName: this.userBasicDetails?.firstName,
      lastName: this.userBasicDetails?.lastName,
      email: this.userContactDetails?.basicDetails?.email || this.userDetails?.Email || '',
      phoneNumber: this.userContactDetails?.basicDetails?.phoneNumber || this.userDetails?.PhoneNumber || '',
      phoneCode: this.userContactDetails?.basicDetails?.phoneCode || '',
      aboutMe: this.userPersonalDetails?.aboutMe,
      gender: this.userBasicDetails?.gender,
      dateOfBirth: this.userBasicDetails?.dateOfBirth,
      foodHabit: this.userPersonalDetails?.diet,
      drinksHabit: this.userPersonalDetails?.drinking,
      smokeHabit: this.userPersonalDetails?.smoking,
      marriageStatus: this.userBasicDetails?.maritalStatus,
      bodyType: this.userPersonalDetails?.bodyType,
      willingToRelocate: this.userPersonalDetails?.canReLocated,
      height: this.userBasicDetails?.height,
      weight: this.userBasicDetails?.weight,
      disability: this.userPersonalDetails?.disability,
      originCountry: this.userFamilyDetails?.originCountry,
      motherTongue: this.userPersonalDetails?.motherTongue,
      knownLanguages: this.userPersonalDetails?.languages,
      bloodGroup: this.userPersonalDetails?.bloodGroup,
      userId: this.userDetails?.UserId,
      religionId: this.UserReligiousDetails?.religion,
      communityId: this.UserReligiousDetails?.communityCast,
      isVisibleCommunity: this.UserReligiousDetails?.isVisible,
      skinComplexion: this.userPersonalDetails?.complexion,
      profileJob: this.userEducationDetails?.sector ? {
        title: this.userEducationDetails?.jobTitle,
        companyName: this.userEducationDetails?.companyName,
        sector: this.userEducationDetails?.sector,
        jobTypeId: this.userEducationDetails?.jobType,
        profileSalary: {
          isAnnual: this.userEducationDetails?.isYearly,
          amount: this.userEducationDetails?.salaryDetails,
          currencyCode: this.userEducationDetails?.currency,
          isVisible: this.userEducationDetails?.isVisible,
        }
      } : null,
      profileLookingFor: {
        gender: this.matchingInfo?.gender,
        minAge: this.matchingInfo?.minAge,
        maxAge: this.matchingInfo?.maxAge,
        country: this.matchingInfo?.country
      },
      profileFamily: {
        fatherName: this.userFamilyDetails?.fatherName,
        fatherOccupation: this.userFamilyDetails?.fatherOccupation,
        motherName: this.userFamilyDetails?.motherName,
        motherOccupation: this.userFamilyDetails?.matherOccupation,
        numberOfSiblings: this.userFamilyDetails?.siblings,
        familyType: this.userFamilyDetails?.familyType
      },
      profileAstrology: {
        nakshathiram: this.UserReligiousDetails?.starNakshathra,
        raasi: this.UserReligiousDetails?.raasi,
        timeOfBirth: this.UserReligiousDetails?.timeOfBirth,
      },
      profileImages: this.userBasicDetails?.profilesImg,
      profileAddresses: this.userAddressList,
      profileEducations: this.userEducationDetails?.highestEducation ? [
        {
          qualification: this.userEducationDetails?.qualification,
          institute: this.userEducationDetails?.institute,
          sortNo: 0,
          educationQualificationId: this.userEducationDetails?.highestEducation,
        }
      ] : null
    };

    this._createUser(body);
  }

  private _createUser(body: any) {
    this.isLoading = true;
    this._memberService.createProfile(body).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.toastr.success("Profile created successfully", "Success");
        this.route.navigateByUrl('member/profiles');
      },
      error: (error: any) => {
        this.isLoading = false;
        this.toastr.error(error.error?.Error?.Detail || "Failed to create profile", error.error?.Error?.Title || "Error");
      }
    });
  }

  public getMainUser() {
    this._authService.mainUser$.subscribe((res: any) => {
      this.mainUser = res;
    });
  }
}
