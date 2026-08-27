import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgForm } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { FORM_MODULES, ROUTER_MODULES } from '../../common-imports';

import { ToastrService } from 'ngx-toastr';
import { MemberService } from '../../../core/services/member.service';

const SUPPORT_EMAIL = 'support@marriagegate.com';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, FORM_MODULES, ROUTER_MODULES],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss'
})

export class ContactUsComponent {
  public baseUrl = environment.baseDomain;
  public currentYear = new Date().getFullYear();

  fullName = '';
  email = '';
  subject = '';
  message = '';
  isSubmitting = false;
  
  ngOnInit() {
     window.scrollTo({ top: 0, behavior: 'smooth' });
   
  }

 constructor(
  private memberService: MemberService,
  private _toster: ToastrService,)
  {}

  // onSubmit(form: NgForm) {
  //   const v = form.value;
  //   const fullName = (v?.fullName ?? this.fullName ?? '').trim();
  //   const email = (v?.email ?? this.email ?? '').trim();
  //   const subject = (v?.subject ?? this.subject ?? '').trim();
  //   const message = (v?.message ?? this.message ?? '').trim();

  //   const subjectEnc = encodeURIComponent(subject || 'Contact from MarriageGate');
  //   const bodyLines = [
  //     `Name: ${fullName || '(not provided)'}`,
  //     `Email: ${email || '(not provided)'}`,
  //     '',
  //     'Message:',
  //     message || '(no message)'
  //   ];
  //   const bodyEnc = encodeURIComponent(bodyLines.join('\n'));
  //   const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${subjectEnc}&body=${bodyEnc}`;
  //   window.location.href = mailtoUrl;
  // }

  
onSubmit(form: NgForm) {

     if (form.invalid) { this._toster.warning('Please fill all required fields.', 'Validation');
      return;
    }


    const payload = {
      fullName: this.fullName.trim(),
      emailAddress: this.email.trim(),
      subject: this.subject.trim(),
      message: this.message.trim()
    };

    this.isSubmitting = true;
     

      this.memberService.sendContactUsMessage(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this._toster.success('Your message has been sent successfully!', 'Success');
        form.resetForm();
      },
      error: () => {
        this.isSubmitting = false;
        this._toster.error('Something went wrong. Please try again later.', 'Error');
      }
    });
  }
}

