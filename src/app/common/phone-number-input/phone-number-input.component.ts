import { CommonModule } from '@angular/common';
import { Component, effect, EventEmitter, Input, Output } from '@angular/core';
import { DataProviderService } from '../../core/services/data-provider.service';
import { FORM_MODULES } from '../common-imports';

@Component({
  selector: 'app-phone-number-input',
  imports: [FORM_MODULES, CommonModule],
  templateUrl: './phone-number-input.component.html',
  styleUrl: './phone-number-input.component.scss',
})
export class PhoneNumberInputComponent {
  @Input() isSubmitted: boolean = false;
  @Input() setPhoneNumber!: number;
  @Input() phoneCode: string = '';
  @Input() isShowLabel: boolean = true;
  @Input() readOnly: boolean = false;
  @Output() phoneNumberEmitter = new EventEmitter<any>();

  public phoneCodes: any = [];
  public selectedCode: any;
  public allPhoneCodes: any[] = [];
  public phoneNumber: any;
  public isValidPn: boolean = true;

  constructor(private dataProvider: DataProviderService) {
    this.phoneCodes = this.dataProvider.getPhoneCode();
    effect(() => {
      const userGeoLocationDetails = this.dataProvider.userGeoLocation();
      const defaultCountryCode = this.phoneCodes.find((pc: any) => pc.iso === userGeoLocationDetails?.country_code);
      if (defaultCountryCode && !this.setPhoneNumber) {
        this.selectedCode = defaultCountryCode.code;
      }
    });
  }

  ngOnInit(): void {
    this.allPhoneCodes = [...this.phoneCodes];
  }

  ngOnChanges(): void {
    this.isValidPn = this.isValidPhoneNumber(this.phoneNumber);
    if (this.setPhoneNumber && this.phoneCode) {
      this.phoneNumber = this.setPhoneNumber;
      let selectedCountry = this.phoneCodes.find(
        (c: any) => c.iso === this.phoneCode
      );
      this.selectedCode = selectedCountry.code;
    }else if(!this.selectedCode){
        this.selectedCode = '41';
      }
  }

  onSearchChange(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    if (!searchTerm) {
      this.phoneCodes = [...this.allPhoneCodes];
      return;
    }

    this.phoneCodes = this.allPhoneCodes.filter((item) => item.country.toLowerCase().includes(searchTerm)
      || item.code.includes(searchTerm)
    );
  }

  emitPhoneNumber() {
    let isValid = this.isValidPhoneNumber(this.phoneNumber);
    if (isValid) {
      this.isValidPn = true;
      let pn = '';
      pn = '+' + this.selectedCode + this.phoneNumber;
      let selectedCountry = this.phoneCodes.find(
        (c: any) => c.code === this.selectedCode
      );
      let phoneNumberDetails = {
        code: selectedCountry.iso,
        phoneNumber: pn,
      };
      this.phoneNumberEmitter.emit(phoneNumberDetails);
    } else {
      this.isValidPn = false;
      this.phoneNumberEmitter.emit({
        code: null,
        phoneNumber: null,
      });
    }
  }

  isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\d{8,}$/;
    return phoneRegex.test(phone);
  }

}
