import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { COMMON_DIRECTIVES, FORM_MODULES } from '../../../../../../common/common-imports';
import { ImageCropperComponent } from "../../../../../../common/image-cropper/image-cropper.component";
import { UserBasicForm, UserProfile } from '../../../../../../models/index.model';
import { MemberService } from './../../../../../../core/services/member.service';

@Component({
  selector: 'app-member-profile-form',
  imports: [COMMON_DIRECTIVES, FORM_MODULES, ImageCropperComponent],
  templateUrl: './member-profile-form.component.html',
  styleUrl: './member-profile-form.component.scss',
  standalone: true,
})
export class MemberProfileFormComponent {
  @Output() basicDetailsEmitter = new EventEmitter<UserBasicForm>();
  @Output() refreshMemberProfileEmitter = new EventEmitter<void>();
  @Input() isEditFrom: boolean = false;
  @Input() memberProfile!: UserProfile;
  @Input() hideGender: boolean = false;

  public isSubmitted: Boolean = false;
  public userBasicFrom!: FormGroup;
  public isLoading: boolean = false;
  public isUploading: boolean = false;
  public images: string[] = [];

  constructor(private fb: FormBuilder, private _memberService: MemberService, private toastr: ToastrService) {
    this._userBasicFromInit();
  }

  private _userBasicFromInit() {
    this.userBasicFrom = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      gender: [1, [Validators.required]],
      dateOfBirth: ['', [Validators.required, minimumAgeValidator(18)]],
      maritalStatus: [1, [Validators.required]],
      height: ['', [Validators.required, Validators.min(1)]],
      weight: ['', [Validators.required, Validators.min(1)]],
      profilesImg: [],
      isVisible: [true],
    })
  }

  // onFileSelected(event: Event): void {
  //   this.isUploading = false;
  //   const input = event.target as HTMLInputElement;
  //   if (!input.files || input.files.length === 0) return;
  //   const file = input.files[0];
  //   const formData = new FormData();
  //   formData.append('file', file);

  //   this._memberService.uploadImageToBulb(formData).subscribe({
  //     next: (res) => {
  //       this.images.push(res.Result);
  //     },
  //     complete:() => {
  //       this.isUploading = false;

  //     },
  //     error: (err) => {
  //       console.error('Upload failed:', err);
  //       this.isUploading = false;
  //     }
  //   });

  //   input.value = '';
  // }

  removeImage(index: number): void {
    this.images.splice(index, 1);
  }

  onImageCropped(event: any): void {
    this.images.push(event);
    let viewModal: HTMLElement = document.getElementById(
      'close-btn'
    ) as HTMLElement;
    if (viewModal) {
      viewModal.click();
    }
  }

  //
  next() {
    this.isSubmitted = true;
    const formValue = this.userBasicFrom.value;
    const profileImages = this.images.map((url, index) => ({
      url,
      isProfile: index === 0,
      isVisible: formValue.isVisible
    }));

    this.userBasicFrom.get('profilesImg')?.patchValue(profileImages);

    if (!this.userBasicFrom.valid || this.images.length === 0) return;

    if (!this.isEditFrom) {
      this.basicDetailsEmitter.emit(this.userBasicFrom.value);
      return;
    }
    if (!this.memberProfile) return;

    this.isLoading = true;

    const updatedProfile = {
      ...this.memberProfile,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      gender: formValue.gender,
      dateOfBirth: formValue.dateOfBirth,
      marriageStatus: formValue.maritalStatus,
      height: formValue.height,
      weight: formValue.weight,
      profileImages: profileImages
    };

    this._memberService.updateMemberProfile(this.memberProfile.id, updatedProfile).subscribe({
      next: () => { },
      complete: () => {
        this.isLoading = false;
        this.toastr.success("Update successfully", 'success');
        this.refreshMemberProfileEmitter.emit();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.toastr.error(error?.error?.Error?.Detail || 'Unknown error', error?.error?.Error?.Title || 'Error');
      }
    });
  }


  public ngOnChanges() {
    if (this.memberProfile) {
      this.userBasicFrom.patchValue({
        gender: this.memberProfile.gender,
        firstName: this.memberProfile.firstName,
        lastName: this.memberProfile.lastName,
        dateOfBirth: this.memberProfile.dateOfBirth,
        maritalStatus: this.memberProfile.marriageStatus,
        height: this.memberProfile.height,
        weight: this.memberProfile.weight,
      });

      this.memberProfile.profileImages.forEach((element: any) => {
        this.images.push(element.url);
        this.userBasicFrom.get('isVisible')?.patchValue(element.isVisible);
      });
    }
  }
}

export function minimumAgeValidator(minAge: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const dobValue = control.value;
    if (!dobValue) return null;


    const today = new Date();
    const birthDate = new Date(dobValue);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust if birthdate hasn't occurred this year yet
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= minAge ? null : { underage: { requiredAge: minAge, actualAge: age } };
  };
}
