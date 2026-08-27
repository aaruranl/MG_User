import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { COMMON_DIRECTIVES, FORM_MODULES } from '../../../../../../common/common-imports';
import { BloodGroup, bodyTypes, Complexion, diet, DrinkHabit, languageList, SmokeHabit, yesOrNo } from '../../../../../../helpers/data';
import { PersonalDetails, UserProfile } from '../../../../../../models/index.model';
import { MemberService } from '../../../../../../core/services/member.service';

@Component({
  selector: 'app-personal-details-form',
  imports: [COMMON_DIRECTIVES, FORM_MODULES],
  templateUrl: './personal-details-form.component.html',
  styleUrl: './personal-details-form.component.scss'
})
export class PersonalDetailsFormComponent {
  @Output() personalDetailsEmitter = new EventEmitter<PersonalDetails>();
  @Output() refreshMemberProfileEmitter = new EventEmitter<void>();
  public userPersonalDetailsForm!: FormGroup;
  @Input() isEditFrom: boolean = false;
  @Input() memberProfile!: UserProfile;

  public isLoading: boolean = false;
  public isSubmitted = false;
  public motherTongueList: any = languageList;
  public selectedMotherTongue = 0;
  public dietList = diet;
  public selectedDiet = 1;

  public yesOrNoList = yesOrNo;

  public drinkHabit = DrinkHabit;
  public SmokeHabit = SmokeHabit;

  public selectedDrinking = 1;
  public selectedSmoke = 1;

  public knownLanguagesList = languageList;
  public selectedKnowLanguage: number[] = [];

  public bodyTypeList = bodyTypes;
  public selectedBodyType = 1;


  public bloodGroupList = BloodGroup;
  public selectedBloodGroup = 0;

  public complexionList = Complexion;
  public SelectedComplexion = 1;


  constructor(private fb: FormBuilder, private _memberService: MemberService,
    private toastr: ToastrService) {
    this._userPersonalInfoFormInit();
  }

  private _userPersonalInfoFormInit() {
    this.userPersonalDetailsForm = this.fb.group({
      aboutMe: ['', [Validators.required, Validators.minLength(20)]],
      disability: [''],
      motherTongue: [''],
      diet: [],
      smoking: [],
      drinking: [],
      languages: [[]],
      bodyType: [],
      canReLocated: [1],
    })
  }

  public next() {
    this.isSubmitted = true
    const formsValue = this.userPersonalDetailsForm.value;
    let names;
    let motherTongue;
    if (this.selectedKnowLanguage) {
      names = this.knownLanguagesList.filter(lang => this.selectedKnowLanguage.includes(lang.id)).map(lang => lang.name);
    }
    if (this.selectedMotherTongue != null) {
      motherTongue = this.motherTongueList.find((lang: any) => lang.id === Number(this.selectedMotherTongue));
    }

    const personalDetailsValue: PersonalDetails = {
      aboutMe: formsValue.aboutMe,
      disability: formsValue.disability,
      motherTongue: motherTongue?.name ?? this.motherTongueList[0].name,
      diet: this.selectedDiet,
      smoking: this.selectedSmoke,
      drinking: this.selectedDrinking,
      languages: names?.join(','),
      bodyType: this.selectedBodyType,
      canReLocated: formsValue.canReLocated,
      bloodGroup: this.selectedBloodGroup,
      complexion: this.SelectedComplexion
    }
    if (this.userPersonalDetailsForm.valid && this.selectedKnowLanguage.length > 0 && this.selectedKnowLanguage.length < 6) {
      if (!this.isEditFrom) {
        this.personalDetailsEmitter.emit(personalDetailsValue);
      } else {
        this.isLoading = true;
        const updatedProfile = {
          ...this.memberProfile,
          aboutMe: formsValue.aboutMe,
          foodHabit: this.selectedDiet,
          drinksHabit: this.selectedDrinking,
          smokeHabit: this.selectedSmoke,
          bodyType: this.selectedBodyType,
          willingToRelocate: formsValue.canReLocated,
          disability: formsValue.disability,
          motherTongue: motherTongue?.name,
          knownLanguages: names?.join(','),
          bloodGroup: this.selectedBloodGroup,
          skinComplexion: this.SelectedComplexion
        }
        this._memberService.updateMemberProfile(this.memberProfile.id, updatedProfile).subscribe({
          next: (res: any) => { },
          complete: () => {
            this.isLoading = false;
            this.toastr.success("Update successfully", 'success');
            this.refreshMemberProfileEmitter.emit();
          },
          error: (error: any) => {
            this.isLoading = false;
            this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
          }
        })
      }
    }
  }

  public ngOnChanges() {
    if (this.memberProfile) {
      this.userPersonalDetailsForm.get('aboutMe')?.patchValue(this.memberProfile.aboutMe);
      this.userPersonalDetailsForm.get('disability')?.patchValue(this.memberProfile.disability);
      this.userPersonalDetailsForm.get('canReLocated')?.patchValue(this.memberProfile.willingToRelocate);

      let motherTang = this.motherTongueList.find((m: any) => m.name === this.memberProfile.motherTongue);
      if (motherTang) {
        this.selectedMotherTongue = motherTang.id;
      }
      this.selectedDiet = this.memberProfile.foodHabit;
      this.selectedSmoke = this.memberProfile.smokeHabit;
      this.selectedDrinking = this.memberProfile.drinksHabit;
      this.selectedBodyType = this.memberProfile.bodyType;

      this.SelectedComplexion = this.memberProfile.skinComplexion ?? 1;

      this.selectedBloodGroup = this.memberProfile.bloodGroup;

      let arrayLan: any = [];
      let selectedLan = this.memberProfile.knownLanguages?.split(',');

      selectedLan?.forEach((lang: string) => {
        const trimmedLang = lang.trim().toLowerCase();
        const match = this.knownLanguagesList.find((kn: any) =>
          kn.name?.toLowerCase() === trimmedLang
        );
        if (match) {
          arrayLan.push(match.id);
        }
      });

      this.selectedKnowLanguage = arrayLan;


    }
  }

  // onLanguageChange() {
  // if (this.selectedKnowLanguage.length > 4) {
  //   this.toastr.warning('You can only select up to 5 languages.', 'Waring')
  // }
  // }

}
