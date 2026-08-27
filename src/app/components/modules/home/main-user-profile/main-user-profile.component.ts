import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { FORM_MODULES } from '../../../../common/common-imports';
import { ImageCropperComponent } from "../../../../common/image-cropper/image-cropper.component";
import { LoadingComponent } from "../../../../common/loading/loading.component";
import { PaymentFailTopBarComponent } from "../../../../common/payment-fail-top-bar/payment-fail-top-bar.component";
import { PhoneNumberInputComponent } from "../../../../common/phone-number-input/phone-number-input.component";
import { AuthService } from '../../../../core/services/auth/auth.service';
import { SocialLoginService } from '../../../../core/services/auth/social-login.service';
import { DataProviderService } from '../../../../core/services/data-provider.service';
import { MemberService } from '../../../../core/services/member.service';
import { MainUser, UserProfile } from './../../../../models/member/member.model';


@Component({
  selector: 'app-main-user-profile',
  imports: [FORM_MODULES, CommonModule, ImageCropperComponent, LoadingComponent, PaymentFailTopBarComponent, PhoneNumberInputComponent],
  templateUrl: './main-user-profile.component.html',
  styleUrl: './main-user-profile.component.scss'
})
export class MainUserProfileComponent {

  public profileForm: FormGroup;
  public isLoading = false;
  public isChangesPasswordLoading: boolean = false;
  public imagePreview: string | null = null;
  public mainUser!: MainUser;
  public selectedMember!: UserProfile;
  public memberProfiles: UserProfile[] = [];
  public isGeneral: boolean = true;
  public isSaveLoading: boolean = false;
  public isSubmitted: boolean = false;
  public isMatchPwd: boolean = true;
  public isDeleteLoading: boolean = false;

  public setPhoneNumber!: any;
  public PhoneCode!: string;
  public defaultCountryCode!: string;

  public countryList: any[] = [];
  private phoneNumberDetails: any;
  private _phoneNumber: string = '';
  public resetPasswordFrom!: FormGroup;
  public images: string = '';

  public passwordStrength = {
    value: 0,
    text: 'None',
    class: ''
  };

  public showNewPassword: boolean = false;
  public showConfirmPassword: boolean = false;

  constructor(private fb: FormBuilder,
    private _memberService: MemberService,
    private _authService: AuthService,
    private _socialLoginService: SocialLoginService,
    private toastr: ToastrService,
    private dataProvider: DataProviderService,
  ) {
    this.profileForm = this.fb.group({
      firstName: ['fse', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      image: ['']
    });
  }


  ngOnInit(): void {
    this.loadProfileData();
    this._getCurrentMember();
    this._getMemberProfiles();
    this._resetFromInit();
    this.countryList = this.dataProvider.getPhoneCode();
    const userGeoLocationDetails = this.dataProvider.userGeoLocation();
  }

  private _setPhoneNumberValues(user: MainUser) {
    let selectedCountry = this.countryList.find((c: any) => c.iso?.toLowerCase() === user?.phoneCode?.toLowerCase());
    this.PhoneCode = selectedCountry.iso;
    let phoneNumber = user.phoneNumber.split('+' + selectedCountry.code);
    this.setPhoneNumber = Number(phoneNumber[1]);

  }

  private _resetFromInit() {
    this.resetPasswordFrom = this.fb.group({
      correctPassword: [null],
      newPassword: [null, [Validators.required]],
      confirmNewPassword: [null, [Validators.required]],
    })
  }

  loadProfileData(): void {
    this.isLoading = true;
    this._memberService.getMainUser().subscribe({
      next: (res: any) => {
        this.mainUser = res;
        this._setPhoneNumberValues(this.mainUser);
      },
      complete: () => {
        this.profileForm.patchValue({
          firstName: this.mainUser.firstName,
          lastName: this.mainUser.lastName,
          email: this.mainUser.email,
          phoneNumber: this.mainUser.phoneNumber,
          image: this.mainUser.image
        });
        this.images = this.mainUser.image;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
      }
    })
  }

  //PHONE NUMBER
  public getPhoneNumber(event: any) {
    this.phoneNumberDetails = event;
    this._phoneNumber = event.phoneNumber;
  }


  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.profileForm.patchValue({ image: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  _authLogout() {
    this._authService.removeAuthToken();
    this._socialLoginService.signOut();
    localStorage.removeItem('clientId');
    localStorage.removeItem('currentMemberId');
    this._authService.setUserDetails(null);
    window.location.href = '/';
  }

  private _getCurrentMember() {
    this._authService.member$.subscribe(data => {
      if (data) {
        this.selectedMember = data;
      }
    })
  }


  private _getMemberProfiles() {
    this._authService.memberList$.subscribe((data) => {
      if (data) {
        this.memberProfiles = data;
      }
    });
  }

  public changeMemberProfile() {
    localStorage.removeItem('currentMemberId');
    localStorage.setItem('currentMemberId', this.selectedMember.id);
    window.location.href = '/';
  }

  onImageCropped(event: any): void {
    this.images = event;
    this.mainUser.image = event;
    let viewModal: HTMLElement = document.getElementById(
      'close-btn'
    ) as HTMLElement;
    if (viewModal) {
      viewModal.click();
    }
  }

  public saveUser() {
    this.isSaveLoading = true;
    let body = this.mainUser;
    body.firstName = this.profileForm.value.firstName;
    body.lastName = this.profileForm.value.lastName;
    body.image = this.images;
    body.phoneNumber = this.phoneNumberDetails?.phoneNumber || this.mainUser?.phoneNumber;
    body.phoneCode = this.phoneNumberDetails?.code || this.mainUser?.phoneCode;

    this._memberService.editMainUser(body).subscribe({
      next: (res: any) => {
        this.toastr.success('Successfully Updated', 'Success');
      },
      complete: () => {
        this.isSaveLoading = false;
        this.mainUser = body;
        this._authService.setMainUser(this.mainUser);
      },
      error: (error: any) => {
        this.isSaveLoading = false;
        this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
      }
    })
  }

  public updatePasswordStrength(isSignUp: boolean): void {
    let password = null;
    password = this.resetPasswordFrom.get('newPassword')?.value;
    this.passwordStrength = { value: 0, text: 'None', class: '' };
    if (!password || password.length === 0) return;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;

    this.passwordStrength.value = strength;
    if (strength < 30) {
      this.passwordStrength.class = 'bg-danger';
      this.passwordStrength.text = 'Weak';
    } else if (strength < 60) {
      this.passwordStrength.class = 'bg-warning';
      this.passwordStrength.text = 'Fair';
    } else if (strength < 80) {
      this.passwordStrength.class = 'bg-info';
      this.passwordStrength.text = 'Good';
    } else {
      this.passwordStrength.class = 'bg-success';
      this.passwordStrength.text = 'Excellent';
    }
  }

  public changesPassword() {
    this.isSubmitted = true;
    this.resetPasswordFrom.valid;
    const pwdValues = this.resetPasswordFrom.value;
    if (pwdValues.newPassword === pwdValues.confirmNewPassword) {
      this.isMatchPwd = true;
    } else {
      this.isMatchPwd = false;
      return;
    }
    if (this.resetPasswordFrom.valid) {
      this.isChangesPasswordLoading = true;
      let body = {
        isSetNewPassword: this.mainUser.isPasswordReset ? false : true,
        currentPassword: this.mainUser.isPasswordReset ? this.resetPasswordFrom.value.correctPassword : null,
        newPassword: this.resetPasswordFrom.value.newPassword
      }

      this._authService.changePassword(body).subscribe({
        next: (res: any) => {
          this._authService.setAuthToken(res.Result.token);
        },
        complete: () => {
          this.mainUser.isPasswordReset = true;
          this._authService.setMainUser(this.mainUser);
          this.isChangesPasswordLoading = false;
          this.isSubmitted = false;
          this.resetPasswordFrom.reset();
          this.passwordStrength = {
            value: 0,
            text: 'None',
            class: ''
          };

          //  this.toastr.success('Password successfully updated','Success');

        },
        error: (error: any) => {
          this.isChangesPasswordLoading = false;
          this.isSubmitted = false;
          this.toastr.error(error.error.Error.Detail, error.error.Error.Title);
        }
      })
    }
  }

  public onInputChange() {
    this.isMatchPwd = true;
  }

  public toggleShowNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  public toggleShowConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  public deleteAccount() {
    this.isDeleteLoading = true;
    this._authService.deleteAccount().subscribe({
      next: () => { },
      complete: () => {
        this.isDeleteLoading = false;
        let deleteModal: HTMLElement = document.getElementById('close-btnsss') as HTMLElement;
        deleteModal.click();
        this._authLogout();
      }
    })
  }


}
