import {
  NgxGpAutocompleteDirective,
  NgxGpAutocompleteModule,
} from '@angular-magic/ngx-gp-autocomplete';
import {
  Component,
  effect,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import {
  COMMON_DIRECTIVES,
  FORM_MODULES,
} from '../../../../../../common/common-imports';
import { Natshathira, raasiList } from '../../../../../../helpers/data';
import { AddressType } from '../../../../../../helpers/enum';
import {
  ProfileAddress,
  UserProfile,
} from '../../../../../../models/index.model';
import { UserReligiousInfo } from '../../../../../../models/Interface/registrationFrom.interface';
import {
  Community,
  SubCommunity,
} from '../../../../../../models/member/community.model';
import { Religion } from '../../../../../../models/member/religion.model';
import { DataProviderService } from './../../../../../../core/services/data-provider.service';
import { MemberService } from './../../../../../../core/services/member.service';
@Component({
  selector: 'app-religious-background-form',
  imports: [COMMON_DIRECTIVES, FORM_MODULES, NgxGpAutocompleteModule],
  templateUrl: './religious-background-form.component.html',
  styleUrl: './religious-background-form.component.scss',
})
export class ReligiousBackgroundFormComponent {
  @ViewChild('ngxPlaces') placesRef!: NgxGpAutocompleteDirective;
  @Output() userReligiousEmitter = new EventEmitter<UserReligiousInfo>();
  @Output() refreshMemberProfileEmitter = new EventEmitter<void>();
  @Input() isEditFrom: boolean = false;
  @Input() memberProfile!: UserProfile;
  public userReligiousForm!: FormGroup;
  public religionList: Religion[] = [];
  public selectedReligions: string = '';

  public isSubmitted: boolean = false;
  public isLoading: boolean = false;

  public countryList: any[] = [];
  public selectedCountry: any;

  public natshathiraList = Natshathira;
  public selectedStar: number = 0;

  public rasiList = raasiList;
  public selectedRaasi: number = 0;

  public communityList: Community[] = [];
  public selectedCommunity: any = null;

  public SubCommunityList: SubCommunity[] = [];
  public selectedSubCommunity: any = null;

  public stateAndProvince: any[] = [];
  public selectedProvince: any;

  constructor(
    private fb: FormBuilder,
    private dataProvider: DataProviderService,
    private memberService: MemberService,
    private toastr: ToastrService
  ) {
    this._userReligiousFormInit();
    this.countryList = this.dataProvider.getPhoneCode();
    // effect(() => {
    //   const userGeoLocationDetails = this.dataProvider.userGeoLocation();
    //   const defaultCountryCode = this.countryList.find(
    //     (pc: any) => pc.iso === userGeoLocationDetails?.country_code
    //   );
    //   if (defaultCountryCode && !this.isEditFrom) {
    //     this.selectedCountry = defaultCountryCode.country;
    //     this.selectedProvince = defaultCountryCode.stateProvinces[0].name;
    //   }
    // });
  }

  ngOnInit(): void {
    this._getCommunity();
    this._getReligion();
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

  private _getCommunity() {
    this.isLoading = true;
    this.memberService.getCommunity().subscribe({
      next: (res: Community[]) => {
        this.communityList = res;
        this.SubCommunityList = res[0].subCommunities;
        if (!this.isEditFrom) {
          // this.selectedCommunity = res[0].id;
          //   this.selectedSubCommunity = res[0].subCommunities[0].id;
        }
      },
      complete: () => {
        this.isLoading = false;
      },
      error: (error: Error) => {
        this.isLoading = false;
      },
    });
  }

  private _getReligion() {
    this.isLoading = true;
    this.memberService.getReligion().subscribe({
      next: (res: Religion[]) => {
        this.religionList = res;
        if (!this.isEditFrom) {
          this.selectedReligions = res[0].id;
        }
      },
      complete: () => {
        this.isLoading = false;
      },
      error: (error: Error) => {
        this.isLoading = false;
      },
    });
  }

  // public changeCommunity(): void {
  //   this.selectedSubCommunity = null;
  //   const selectedCommunity = this.communityList.find(
  //     (community: Community) => community.id === this.selectedCommunity
  //   );

  //  this.SubCommunityList = selectedCommunity?.subCommunities ?? [];
  //  this.selectedSubCommunity = this.SubCommunityList[0] ? this.SubCommunityList[0].id : null ;
  // }

  public changeRasi(event: any) {
    if (event === null) {
      this.selectedStar = 0;
    }
    if (!event) {
      this.natshathiraList = Natshathira;
    } else {
      let rasi = this.rasiList.find((n) => n.id === this.selectedRaasi);
      if (rasi) {
        this.natshathiraList = rasi.rasi;
        this.selectedStar = this.natshathiraList[0].id;
      }
    }
  }

  private _userReligiousFormInit() {
    this.userReligiousForm = this.fb.group({
      religion: [''],

      communityCast: [''],
      timeOfBirth: [null],
      isVisible: [true],
      subCast: [''],
      starNakshathra: [''],
      raasi: [''],

      //doorNumber:[],
      street: ['', Validators.required],
      // zipCode:['',Validators.required],
      city: ['', Validators.required],
      stateProvince: ['', [Validators.required]],
      country: ['', [Validators.required]],
      latitude: [0],
      longitude: [0],
    });
  }

  public next() {
    this.isSubmitted = true;
    const formValue = this.userReligiousForm.value;
    const address: ProfileAddress = {
      number: null,
      street: formValue.street,
      city: formValue.city,
      state: formValue.stateProvince,
      zipcode: null,
      country: formValue.country,
      latitude: formValue.latitude,
      longitude: formValue.longitude,
      addressType: AddressType.birth,
      residentStatus: null,
      isDefault: true,
    };
    const data = {
      religion: this.selectedReligions,
      communityCast: this.selectedCommunity,
      timeOfBirth: formValue.timeOfBirth,

      starNakshathra: this.selectedStar,
      raasi: this.selectedRaasi,
      chevvaiDosham: formValue.chevvaiDosham,
      horoscopeMatching: formValue.horoscopeMatching,
      address: address,
      isVisible: formValue.isVisible,
    };
    if (this.userReligiousForm.valid) {
      if (!this.isEditFrom) {
        this.userReligiousEmitter.emit(data);
      } else {
        this.isLoading = true;

        this.memberProfile.profileAddresses.forEach((a: any) => {
          if (a.addressType === 3) {
            a.number = null;
            a.street = formValue.street;
            a.city = formValue.city;
            a.state = formValue.stateProvince;
            a.zipcode = null;
            a.country = formValue.country;
            a.latitude = formValue.latitude;
            a.longitude = formValue.longitude;
            a.addressType = 3;
            a.residentStatus = null;
            a.isDefault = true;
          }
        });
        const birthAddressIndex = this.memberProfile.profileAddresses.findIndex(
          (a: any) => a.addressType === AddressType.birth
        );

        if (birthAddressIndex > -1) {
          this.memberProfile.profileAddresses[birthAddressIndex] = address;
        } else {
          this.memberProfile.profileAddresses.push(address);
        }

        const updatedProfile = {
          ...this.memberProfile,
          religionId: this.selectedReligions,
          communityId: this.selectedCommunity,
          // subCommunityId: this.selectedSubCommunity ,
          isVisibleCommunity: formValue.isVisible,

          profileAstrology: {
            id: this.memberProfile.profileAstrology.id,
            nakshathiram: this.selectedStar,
            raasi: this.selectedRaasi,
            timeOfBirth: formValue.timeOfBirth,
          },
          profileAddresses: this.memberProfile.profileAddresses,
        };
        this.memberService
          .updateMemberProfile(this.memberProfile.id, updatedProfile)
          .subscribe({
            next: (res: any) => { },
            complete: () => {
              this.isLoading = false;
              this.toastr.success('Update successfully', 'success');
              this.refreshMemberProfileEmitter.emit();
            },
            error: (error: any) => {
              this.isLoading = false;
              this.toastr.error(
                error.error.Error.Detail,
                error.error.Error.Title
              );
            },
          });
      }
    }
  }

  ngOnChanges() {
    const birthAddress = this.memberProfile.profileAddresses?.find(
      (add: any) => add.addressType === AddressType.birth
    );
    let rasi = this.rasiList.find((n) => n.id === this.memberProfile.profileAstrology.raasi);
    if (rasi) {
      this.natshathiraList = rasi.rasi;

    }

    this.selectedReligions = this.memberProfile.religionId;
    this.selectedCommunity = this.memberProfile.communityId;
    this.selectedStar = this.memberProfile.profileAstrology.nakshathiram;
    this.selectedRaasi = this.memberProfile.profileAstrology.raasi;

    this.userReligiousForm
      .get('timeOfBirth')
      ?.patchValue(this.memberProfile.profileAstrology.timeOfBirth);
    this.userReligiousForm.get('street')?.patchValue(birthAddress?.street);
    this.userReligiousForm.get('city')?.patchValue(birthAddress?.city);
    this.userReligiousForm
      .get('stateProvince')
      ?.patchValue(birthAddress?.state);
    this.userReligiousForm.get('country')?.patchValue(birthAddress?.country);
    this.userReligiousForm
      .get('isVisible')
      ?.patchValue(this.memberProfile.isVisibleCommunity);
  }


  // GOODLE AUTO COMPLETE
  public handleAddressChange(place: any): void {
    if (!place || !place.geometry || !place.address_components) {
      console.warn('Invalid place object');
      return;
    }

    let streetNumber = '';
    let streetName = '';
    let city = '';
    let province = '';
    let country = '';
    let countryCode = '';

    for (const component of place.address_components) {
      const types = component.types;

      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      }

      if (types.includes('route')) {
        streetName = component.long_name;
      }

      if (types.includes('locality')) {
        city = component.long_name;
      }

      if (types.includes('administrative_area_level_1')) {
        province = component.long_name;
      }

      if (types.includes('country')) {
        country = component.long_name;
        countryCode = component.short_name;
      }
    }

    const fullStreet = `${streetNumber} ${streetName}`.trim();
    this.userReligiousForm.patchValue({
      street: streetName || fullStreet,
      city: city || '',
      stateProvince: province || '',
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      country: country || '',
    });
  }
}
