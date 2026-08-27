import { Component, EventEmitter, Output } from '@angular/core';
import { FORM_MODULES } from '../../../common/common-imports';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verification',
  imports: [FORM_MODULES,CommonModule],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.scss'
})
export class VerificationComponent {
  @Output() otpEmitter = new EventEmitter<any>();
  public otpForm!:FormGroup;
  public length: number = 6;
  public inputControls: string[] = [];
  public isLoading:boolean = false;
  constructor(  private formBuilder: FormBuilder,){
    this._otpFormInit();
  }

  private _otpFormInit() {
    this.length = 6;
    this.otpForm = this.formBuilder.group({});
    this.inputControls = Array(this.length).fill('').map((_, i) => `otp-${i}`);

    const otpControls: any = {};
    this.inputControls.forEach(controlName => {
      otpControls[controlName] = ['', [Validators.required, Validators.pattern('^[0-9]$')]];
    });
    this.otpForm = this.formBuilder.group(otpControls);
    this.otpForm.valueChanges.subscribe(values => {
    });
  }


  onInput(event: any, index: number): void {
    const input = event.target;
    const value = input.value;

    if (value && value.length === 1 && /^\d$/.test(value)) {
      if (index < this.length - 1) {
        const nextInput = input.nextElementSibling;
        if (nextInput) {
          nextInput.focus();
        }
      }

      const allFilled = this.inputControls.every(control =>
        this.otpForm.get(control)?.value?.length === 1
      );

      if (allFilled) {
        const otp = this.inputControls
          .map(control => this.otpForm.get(control)?.value)
          .join('');
          this.otpEmitter.emit(Number(otp));
      }
    } else {
      this.otpForm.get(this.inputControls[index])?.setValue('');
    }
  }


  public onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    if (!event.clipboardData) {
      return;
    }
    const pastedData = event.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, this.length);
    if (digits.length > 0) {
      digits.forEach((digit, i) => {
        if (i < this.length) {
          this.otpForm.get(this.inputControls[i])?.setValue(digit);
        }
      });
      const focusIndex = Math.min(digits.length, this.length - 1);
      const inputElements = document.querySelectorAll('.otp-input');
      if (inputElements && inputElements[focusIndex]) {
        (inputElements[focusIndex] as HTMLInputElement).focus();
      }
      const allFilled = this.inputControls.every(control =>
        this.otpForm.get(control)?.value?.length === 1
      );
      if (allFilled) {
        const otp = this.inputControls
          .map(control => this.otpForm.get(control)?.value)
          .join('');
          this.otpEmitter.emit(Number(otp));
      }
    }
  }

  public onKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace') {
      if (input.value === '') {
        if (index > 0) {
          const prevInput = input.previousElementSibling as HTMLInputElement;
          if (prevInput) {
            prevInput.focus();
            prevInput.select();
          }
        }
      }
    } else if (event.key === 'ArrowLeft') {
      if (index > 0) {
        const prevInput = input.previousElementSibling as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
          prevInput.select();
        }
      }
      event.preventDefault();
    } else if (event.key === 'ArrowRight') {
      if (index < this.length - 1) {
        const nextInput = input.nextElementSibling as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }
      event.preventDefault();
    }
  }

  public getOtpValue(){
    if (!this.otpForm || !this.otpForm.value) {
      this.otpEmitter.emit(0);
    }
    const otp = this.inputControls
      .map(controlName => this.otpForm.get(controlName)?.value || '')
      .join('');
      this.otpEmitter.emit(Number(otp));
  }

  public clear(): void {
    this.inputControls.forEach(controlName => {
      this.otpForm.get(controlName)?.setValue('');
    });
    const firstInput = document.querySelector('.otp-input') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  }


  trackByFn(index: number): number {
    return index;
  }

}
