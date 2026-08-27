import { Component, effect, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { COMMON_DIRECTIVES, FORM_MODULES } from '../../../../../../common/common-imports';
import { LookingForList } from '../../../../../../helpers/data';
import { MatchPreferences, UserProfile } from '../../../../../../models/index.model';
import { DataProviderService } from '../../../../../../core/services/data-provider.service';
import { MemberService } from './../../../../../../core/services/member.service';

@Component({
  selector: 'app-looking-for-form',
  imports: [FORM_MODULES, COMMON_DIRECTIVES],
  templateUrl: './looking-for-form.component.html',
  styleUrl: './looking-for-form.component.scss'
})
export class LookingForFormComponent {
  @Output() userMatchingDetailsEmitter = new EventEmitter<MatchPreferences>();
  @Output() refreshMemberProfileEmitter = new EventEmitter<void>();
  @Input() isEditFrom: boolean = false;
  @Input() memberProfile!: UserProfile;
  public lookingForList: any = LookingForList;
  public countryList: any[] = [];
  public selectedCountry: any;

  public profileMatchingForm!: FormGroup;

  public SelectedLookingFor: number = 1;
  public selectedMatch: number = 1;

  public isSubmitted: boolean = false;
  public isLoading: boolean = false;
  constructor(
    private _fb: FormBuilder,
    private dataProvider: DataProviderService,
    private _memberService: MemberService,
    private toastr: ToastrService

  ) {
    this._matchingProfileFormInit();
    this.countryList = this.dataProvider.getPhoneCode();
    // effect(() => {
    //   const userGeoLocationDetails = this.dataProvider.userGeoLocation();
    //   const defaultCountryCode = this.countryList.find((pc: any) => pc.iso === userGeoLocationDetails?.country_code);
    //   if (defaultCountryCode) {
    //     this.selectedCountry = defaultCountryCode.country;
    //   }else{
    //      this.selectedCountry = this.countryList[0].country;
    //   }
    // });

  }

  ngOnInit(): void {
    this.scrollToTop();
    const userGeoLocationDetails = this.dataProvider.userGeoLocation();
    const defaultCountryCode = this.countryList.find((pc: any) => pc.iso === userGeoLocationDetails?.country_code);
    if(!this.isEditFrom) {
      if (defaultCountryCode) {
        this.selectedCountry = defaultCountryCode.country;
      }else{
         this.selectedCountry = this.countryList[0].country;
      }
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  private _matchingProfileFormInit() {
    this.profileMatchingForm = this._fb.group(
      {
        gender: [1],
        minAge: ['', [Validators.required, Validators.min(18)]],
        maxAge: ['', [Validators.required, Validators.max(60)]],
      },
      {
        validators: [minLessThanMaxValidator('minAge', 'maxAge')]
      }
    );

  }

  public next() {
    this.isSubmitted = true;
    const formValue = this.profileMatchingForm.value;
    if (this.profileMatchingForm.valid) {
      const quesData = {
        profileFor: this.SelectedLookingFor,
        gender: formValue.gender,
        minAge: formValue.minAge,
        maxAge: formValue.maxAge,
        country: this.selectedCountry,
      }
      if (!this.isEditFrom) {
        this.userMatchingDetailsEmitter.emit(quesData);
        return;
      }
      else {
        this.isLoading = true;
        const updatedProfile = {
          ...this.memberProfile,
          profileFor: quesData.profileFor,
          profileLookingFor: {
            ...this.memberProfile.profileLookingFor,
            country: this.selectedCountry,
            gender: quesData.gender,
            minAge: quesData.minAge,
            maxAge: quesData.maxAge,
          }
        };

        this._memberService.updateMemberProfile(this.memberProfile.id, updatedProfile).subscribe({
          next: (res: any) => { },
          complete: () => {
            this.isLoading = false;
            this.toastr.success("Update successfully", 'success');
            // Parent reloads fresh data so Step 2 doesn't show stale values
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
      console.log(this.memberProfile.profileLookingFor);
      this.profileMatchingForm.get('gender')?.patchValue(this.memberProfile.profileLookingFor.gender);
      this.profileMatchingForm.get('minAge')?.patchValue(this.memberProfile.profileLookingFor.minAge);
      this.profileMatchingForm.get('maxAge')?.patchValue(this.memberProfile.profileLookingFor.maxAge);
      this.SelectedLookingFor = this.memberProfile.profileFor;
      this.selectedCountry = this.memberProfile.profileLookingFor.country;
    }
  }

}


export function minLessThanMaxValidator(minField: string, maxField: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const min = group.get(minField)?.value;
    const max = group.get(maxField)?.value;

    if (min !== null && max !== null && min !== '' && max !== '' && Number(min) >= Number(max)) {
      return { minGreaterThanMax: true };
    }

    return null;
  };
}
