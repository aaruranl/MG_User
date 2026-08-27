import { Component, EventEmitter, Output } from '@angular/core';
import { ImageCropperComponent as imgCropper, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MemberService } from '../../core/services/member.service';


interface AspectRatio {
  label: string;
  value: number;
}

@Component({
  selector: 'app-image-cropper',
  imports: [imgCropper,CommonModule],
  templateUrl: './image-cropper.component.html',
  styleUrl: './image-cropper.component.scss'
})
export class ImageCropperComponent {
  @Output() imageCroppedEvent = new EventEmitter<string | string>();
  public imageChangedEvent: Event | null = null;
  public croppedImage: SafeUrl | string = '';
  public croppedBlob: Blob | null = null;
  public showPreview = true;
  public maintainAspectRatio = true;
  public roundCropper = false;
  public currentAspectRatio = 4 / 3;
  public selectedRatio = 4 / 3;
  public isUploading:boolean = false;

  aspectRatios: AspectRatio[] = [
    { label: '1:1', value: 1 / 1 },
    { label: '4:3', value: 4 / 3 },
    { label: '16:9', value: 16 / 9 },
    { label: '3:2', value: 3 / 2 }
  ];

  constructor(private sanitizer: DomSanitizer,private _memberService:MemberService) {}

  public fileChangeEvent(event: Event): void {
    this.imageChangedEvent = event;
  //  this.showPreview = false;
  }

  public imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl!);
    this.croppedBlob = event.blob!;
  }

  public imageLoaded(image: LoadedImage): void {

  }

  public cropperReady(): void {

  }

  public loadImageFailed(): void {
    alert('Failed to load image. Please try another file.');
  }

  public setAspectRatio(ratio: number): void {
    this.selectedRatio = ratio;
    if (isNaN(ratio)) {
      this.maintainAspectRatio = false;
    } else {
      this.maintainAspectRatio = true;
      this.currentAspectRatio = ratio;
    }
  }

  public resetImage(): void {
    this.imageChangedEvent = null;
    this.croppedImage = '';
    this.croppedBlob = null;
    this.showPreview = false;
    this.selectedRatio = 4 / 3;
    this.currentAspectRatio = 4 / 3;
    this.maintainAspectRatio = true;
  }

  public cancelCrop(): void {
    this.resetImage();
  }

  async saveCroppedImage(): Promise<void> {
    if (!this.croppedBlob) {
      console.warn('No cropped image to upload');
      return;
    }
    this.isUploading = true;
    try {
      const compressedBlob = await compressBlob(this.croppedBlob, 1024, 0.8);
      const formData = new FormData();
      formData.append('file', compressedBlob, `cropped-image-${Date.now()}.png`);
      this._memberService.uploadImageToBulb(formData).subscribe({
        next: (res) => {
          this.imageCroppedEvent.emit(res.Result);
          this.showPreview = true;
          this.resetImage();
        },
        error: (err) => {
          console.error('Upload failed:', err);
        },
        complete: () => {
          this.isUploading = false;
        }
      });
    } catch (error) {
      this.isUploading = false;
    }
  }


}
export function compressBlob(blob: Blob, maxWidth: number = 1024, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => {
        if (b) resolve(b);
      }, 'image/png', quality);
    };
    img.src = URL.createObjectURL(blob);
  });
}
