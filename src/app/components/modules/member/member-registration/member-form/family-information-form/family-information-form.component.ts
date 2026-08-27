import { Component, EventEmitter, Input, Output, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { COMMON_DIRECTIVES, FORM_MODULES } from '../../../../../../common/common-imports';
import { familyTypeList } from '../../../../../../helpers/data';
import { UserFamilyInfo, UserProfile } from '../../../../../../models/index.model';
import { DataProviderService } from '../../../../../../core/services/data-provider.service';
import { MemberService } from '../../../../../../core/services/member.service';

import { CountryDropdownComponent } from '../../../../../../common/country-dropdown/country-dropdown.component';

@Component({
  selector: 'app-family-information-form',
  imports: [COMMON_DIRECTIVES, FORM_MODULES, CountryDropdownComponent],
  templateUrl: './family-information-form.component.html',
  styleUrl: './family-information-form.component.scss'
})
export class FamilyInformationFormComponent {
  @Output() userFamilyEmitter = new EventEmitter<UserFamilyInfo>();
  @Output() refreshMemberProfileEmitter = new EventEmitter<void>();
  @Input() isEditFrom: boolean = false;
  @Input() memberProfile!: UserProfile;
  public userFamilyInfoForm!: FormGroup;
  public isSubmitted: boolean = false;
  public isLoading: boolean = false;
  public familyTypeList = familyTypeList;
  public selectedFamily: number = 1;

  public countryList: any[] = [];
  public selectedCountry: any;

  constructor(private fb: FormBuilder, private _memberService: MemberService, private dataProvider: DataProviderService,
    private toastr: ToastrService) {
    this._userFamilyInfoFormInit();
    this.countryList = this.dataProvider.getPhoneCode();
    // effect(() => {
    //   const userGeoLocationDetails = this.dataProvider.userGeoLocation();
    //   const defaultCountryCode = this.countryList.find((pc: any) => pc.iso === userGeoLocationDetails?.country_code);
    //   if (defaultCountryCode && !this.isEditFrom) {
    //     this.selectedCountry = defaultCountryCode.country;
    //   }else{
    //      this.selectedCountry = this.countryList[0].country;
    //   }
    // });

  }

  ngOnInit() {
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

  private _userFamilyInfoFormInit() {
    this.userFamilyInfoForm = this.fb.group({
      fatherName: ['', Validators.required],
      motherName: ['', Validators.required],
      fatherOccupation: ['', Validators.required],
      matherOccupation: ['', Validators.required],
      siblings: ['', Validators.required],
      familyType: [1]
    })
  }

  next() {
    this.isSubmitted = true;
    if (this.userFamilyInfoForm.valid) {
      if (!this.isEditFrom) {
        const emitData = this.userFamilyInfoForm.value;
        emitData['originCountry'] = this.selectedCountry;
        this.userFamilyEmitter.emit(emitData);
      } else {
        this.isLoading = true;
        const updatedProfile = {
          ...this.memberProfile,
          originCountry: this.selectedCountry,
          profileFamily: {
            fatherName: this.userFamilyInfoForm.value.fatherName,
            fatherOccupation: this.userFamilyInfoForm.value.fatherOccupation,
            motherName: this.userFamilyInfoForm.value.motherName,
            motherOccupation: this.userFamilyInfoForm.value.matherOccupation,
            numberOfSiblings: this.userFamilyInfoForm.value.siblings,
            familyType: this.userFamilyInfoForm.value.familyType,
            id: this.memberProfile.profileFamily.id
          },
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

  ngOnChanges() {
    this.selectedFamily = this.memberProfile.profileFamily.familyType;
    this.userFamilyInfoForm.get('fatherName')?.patchValue(this.memberProfile.profileFamily.fatherName);
    this.userFamilyInfoForm.get('motherName')?.patchValue(this.memberProfile.profileFamily.motherName);
    this.userFamilyInfoForm.get('fatherOccupation')?.patchValue(this.memberProfile.profileFamily.fatherOccupation);
    this.userFamilyInfoForm.get('matherOccupation')?.patchValue(this.memberProfile.profileFamily.motherOccupation);
    this.userFamilyInfoForm.get('siblings')?.patchValue(this.memberProfile.profileFamily.numberOfSiblings);
    this.userFamilyInfoForm.get('familyType')?.patchValue(this.memberProfile.profileFamily.familyType);
    this.selectedCountry = this.memberProfile.originCountry;
  }
}
