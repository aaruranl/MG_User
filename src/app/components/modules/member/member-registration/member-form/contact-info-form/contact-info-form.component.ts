
import { NgxGpAutocompleteDirective, NgxGpAutocompleteModule } from "@angular-magic/ngx-gp-autocomplete";
import { CommonModule } from '@angular/common';
import { Component, effect, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import {
  COMMON_DIRECTIVES,
  FORM_MODULES,
} from '../../../../../../common/common-imports';
import { PhoneNumberInputComponent } from '../../../../../../common/phone-number-input/phone-number-input.component';
import { residencyStatusList } from '../../../../../../helpers/data';
import { AddressType } from '../../../../../../helpers/enum';
import { UserProfile } from '../../../../../../models/index.model';
import { MemberService } from '../../../../../../core/services/member.service';
import { DataProviderService } from './../../../../../../core/services/data-provider.service';
@Component({
  selector: 'app-contact-info-form',
  imports: [COMMON_DIRECTIVES, FORM_MODULES, PhoneNumberInputComponent, CommonModule, NgxGpAutocompleteModule],
  templateUrl: './contact-info-form.component.html',
  styleUrl: './contact-info-form.component.scss',
  standalone: true,
})
export class ContactInfoFormComponent {
  @ViewChild('ngxPlaces') placesRef!: NgxGpAutocompleteDirective;
  @Output() contactDetailsEmitter = new EventEmitter<any>();

  @Output() refreshMemberProfileEmitter = new EventEmitter<void>();
  @Input() isEditFrom: boolean = false;
  @Input() memberProfile!: UserProfile;

  public isSubmitted: boolean = false;
  public userContactFrom!: FormGroup;
  public isLoading: boolean = false;
  public isTemporaryAddress = false;
  private _phoneNumber: string = '';

  public setPhoneNumber!: any;
  public PhoneCode!: string;
  private phoneNumberDetails: any;

  private exitingPermanentAddress: any;
  private exTempPermanentAddress: any;

  public stateAndProvince: any[] = [];
  public selectedProvince: any;


  public countryList: any[] = [];
  public selectedCountry: any;
  public selectedTempCountry: any;
  public residencyStatusList = residencyStatusList;
  public selectedTempResidency: number = 1;
  public selectedResidency: number = 1;

  //   autocompleteOptions = {
  //   types: ['address'], // or ['(cities)'], ['establishment']
  //   componentRestrictions: { country: ['LK'] }, // restrict to specific countries
  //   fields: ['formatted_address', 'geometry', 'name'] // optional fields to return
  // };
  constructor(
    private fb: FormBuilder,
    private dataProvider: DataProviderService,
    private _memberService: MemberService,
    private toastr: ToastrService
  ) {
    this._userContactFromInit();
    this.countryList = this.dataProvider.getPhoneCode();
    // effect(() => {
    //   const userGeoLocationDetails = this.dataProvider.userGeoLocation();
    //   const defaultCountryCode = this.countryList.find(
    //     (pc: any) => pc.iso === userGeoLocationDetails?.country_code
    //   );
    //   if (defaultCountryCode && !this.isEditFrom) {
    //     this.selectedCountry = defaultCountryCode.country;
    //     this.selectedTempCountry = defaultCountryCode.country;
    //     this.selectedProvince = defaultCountryCode.stateProvinces[0].name;
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

  private _userContactFromInit() {
    this.userContactFrom = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      doorNumber: [''],
      street: ['', Validators.required],
      city: ['', Validators.required],
      stateProvince: [null, [Validators.required]],
      residencyStatus: [1, Validators.required],
      zipCode: ['', Validators.required],
      addressType: [0],
      latitude: [0],
      longitude: [0],
      isVisiblePhoneNumber: [true],
      // province:[null,[Validators.required]],
      country: [null, [Validators.required]]
      // temporaryAddress: this.fb.group({
      //   doorNumber: [''],
      //   street: [''],
      //   city: [''],
      //   stateProvince: [''],
      //   residencyStatus: [1],
      //   zipCode: [''],
      //   addressType: [1],
      // }),
    });
  }





  //PHONE NUMBER
  public getPhoneNumber(event: any) {
    this.phoneNumberDetails = event;
    this._phoneNumber = event.phoneNumber;
    this.userContactFrom.get('phoneNumber')?.setValue(this._phoneNumber);
  }

  public next() {
    this.isSubmitted = true;
    if (!this.userContactFrom.value.phoneNumber) {
      this.setPhoneNumber = null;
      return;
    }
    const permanentAddress: any = {
      id: this.exitingPermanentAddress ? this.exitingPermanentAddress.id : null,
      number: this.userContactFrom.value.doorNumber,
      street: this.userContactFrom.value.street,
      city: this.userContactFrom.value.city,
      state: this.userContactFrom.value.stateProvince,
      zipcode: this.userContactFrom.value.zipCode,
      country: this.userContactFrom.value.country,
      latitude: this.userContactFrom.value.latitude,
      longitude: this.userContactFrom.value.longitude,
      addressType: AddressType.living,
      residentStatus: this.selectedResidency,
      isDefault: true,
    };

    if (!this.isEditFrom) { delete permanentAddress.id; }
    const basicDetails = {
      email: this.userContactFrom.value.email,
      phoneNumber: this.userContactFrom.value.phoneNumber,
      isVisiblePhoneNumber: this.userContactFrom.value.isVisiblePhoneNumber,
      phoneCode: this.phoneNumberDetails ? this.phoneNumberDetails.code : this.memberProfile?.phoneCode,
    };

    const formValues: any = {
      address: [permanentAddress],
      basicDetails: basicDetails,
    };

    if (this.userContactFrom.valid) {
      if (!this.isEditFrom) {
        this.contactDetailsEmitter.emit(formValues);
        return;
      } else {
        //update flow
        this.isLoading = true;
        const birthAddress = this.memberProfile.profileAddresses.find((a: any) => a.addressType === AddressType.birth);
        if (birthAddress) {
          formValues.address.push(birthAddress);
        }

        const updatedProfile = {
          ...this.memberProfile,
          email: formValues.basicDetails.email,
          phoneNumber: formValues.basicDetails.phoneNumber,
          isVisiblePhoneNumber: this.userContactFrom.value.isVisiblePhoneNumber,
          profileAddresses: formValues.address,
          phoneCode: formValues.basicDetails.phoneCode,
        };

        this._memberService.updateMemberProfile(this.memberProfile.id, updatedProfile).subscribe({
          next: () => { },
          complete: () => {
            this.isLoading = false;
            this.toastr.success('Update successfully', 'success');
            this.refreshMemberProfileEmitter.emit();
          },
          error: (error: any) => {
            this.isLoading = false;
            this.toastr.error(
              error?.error?.Error?.Detail || 'Unknown error',
              error?.error?.Error?.Title || 'Error'
            );
          },
        });
      }
    }
  }

  public addTemAddress() {
    this.isTemporaryAddress = !this.isTemporaryAddress;
    const fields = [
      'city',
      'stateProvince',
      'country',
      'residencyStatus',
      'street',
      'zipCode',
    ];
    fields.forEach((field) => {
      const control = this.userContactFrom.get(`temporaryAddress.${field}`);
      if (control) {
        if (!this.isTemporaryAddress) {
          control.clearValidators();
        } else {
          control.addValidators(Validators.required);
        }
        control.updateValueAndValidity();
      }
    });
  }

  public ngOnChanges(): void {
    const permanentAddress = this.memberProfile.profileAddresses?.find(
      (add: any) => add.addressType === AddressType.living
    );
    const tempAddress = this.memberProfile.profileAddresses?.find(
      (add: any) => add.addressType === AddressType.living
    );
    if (tempAddress) {
      this.isTemporaryAddress = true;
    } else {
      this.isTemporaryAddress = false;
    }
    this.exitingPermanentAddress = permanentAddress;
    this.exTempPermanentAddress = tempAddress;

    //this.selectedCountry = permanentAddress?.country;
    this.selectedTempCountry = tempAddress?.country;
    this.selectedResidency = permanentAddress?.residentStatus || 1;
    this.selectedTempResidency = tempAddress?.residentStatus || 1;
    // this.selectedProvince = permanentAddress?.state;
    this._setPhoneNumberValues();

    this.userContactFrom.patchValue({
      email: this.memberProfile.email,
      phoneNumber: this.memberProfile.phoneNumber,
      isVisiblePhoneNumber: this.memberProfile.isVisiblePhoneNumber,
      doorNumber: permanentAddress?.number || '',
      street: permanentAddress?.street || '',
      city: permanentAddress?.city || '',
      longitude: permanentAddress?.latitude || 0,
      latitude: permanentAddress?.longitude || 0,
      stateProvince: permanentAddress?.state || '',
      country: permanentAddress?.country,
      residencyStatus: permanentAddress?.residentStatus || 1,
      zipCode: permanentAddress?.zipcode || '',
      addressType: permanentAddress?.addressType || 0,
      temporaryAddress: {
        doorNumber: tempAddress?.number || '',
        street: tempAddress?.street || '',
        city: tempAddress?.city || '',
        //   stateProvince: tempAddress?.state || '',
        residencyStatus: tempAddress?.residentStatus || 1,
        zipCode: tempAddress?.zipcode || '',
        addressType: tempAddress?.addressType || 3,
      },
    });
    // this.changeCountry();
  }

  private _setPhoneNumberValues() {
    let selectedCountry = this.countryList.find((c: any) => c.iso?.toLowerCase() === this.memberProfile.phoneCode?.toLowerCase());
    this.PhoneCode = selectedCountry.iso;
    let phoneNumber = this.memberProfile.phoneNumber.split('+' + selectedCountry.code);
    this.setPhoneNumber = Number(phoneNumber[1]);
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // public changeCountry(){
  //  const country = this.countryList.find((country:any) => country.country === this.selectedCountry);
  //  this.stateAndProvince = country.stateProvinces;
  //  this.selectedProvince = country.stateProvinces[0].name;
  // }

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
    let postalCode = '';

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
      }

      if (types.includes('postal_code')) {
        postalCode = component.long_name;
      }
    }

    const fullStreet = `${streetNumber} ${streetName}`.trim();
    this.userContactFrom.patchValue({
      doorNumber: streetNumber || '',
      street: streetName || fullStreet,
      city: city || '',
      stateProvince: province || '',
      zipCode: postalCode || '',
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      country: country || '',
      province: province || '',
    });
    // let selectedCountry = this.countryList.find((c: any) => c.country?.toLowerCase().includes(country.toLowerCase()));
    // this.selectedCountry = selectedCountry.country;
    //   this.selectedProvince = province;
    //this.changeCountry();
  }
}
