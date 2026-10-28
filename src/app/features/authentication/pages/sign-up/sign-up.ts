import { Component, ChangeDetectorRef, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { Subscription } from 'rxjs';

/**
 * Error state matcher to show error immediately when confirmPassword is
 * touched or dirty and passwords do not match.
 */
export class ConfirmPasswordErrorMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null,
  ): boolean {
    const isSubmitted = form?.submitted;
    const isControlInvalid = !!(control?.invalid && (control.dirty || control.touched || isSubmitted));
    const isMismatch = !!(
      form?.hasError('passwordMismatch') &&
      (control?.dirty || control?.touched || isSubmitted)
    );

    return isControlInvalid || isMismatch;
  }
}

/**
 * Validates that the password satisfies:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one special character
 * - At least one number
 */
const passwordStrengthValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value || '';
  if (!value) {
    return null;
  }

  const hasMinLength = value.length >= 8;
  const hasUpperCase = /[A-Z]/.test(value);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(value);
  const hasNumber = /[0-9]/.test(value);

  if (!hasMinLength || !hasUpperCase || !hasSpecialChar || !hasNumber) {
    return { invalidPasswordFormat: true };
  }

  return null;
};

const passwordsMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSliderModule,
    RouterLink
  ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUp implements OnDestroy {
  showPassword = false;
  showConfirmPassword = false;
  statusMessage = '';
  readonly confirmPasswordMatcher = new ConfirmPasswordErrorMatcher();
cropImageWidth = 0;
cropImageHeight = 0;
  // Profile picture constants
  readonly maxProfilePicSizeBytes = 5 * 1024 * 1024; // 5 MB
  readonly allowedProfilePicTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  profilePicPreview: string | null = null;
  profilePicFileName: string | null = null;
  profilePicError: string | null = null;

  // Large Preview Modal State
  isViewModalOpen = false;

  // Cropping Modal State
  isCropModalOpen = false;
  rawImageSrc: string | null = null;
  cropZoom = 1;
  cropPanX = 0;
  cropPanY = 0;
  isDraggingCrop = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private initialPanX = 0;
  private initialPanY = 0;
  private pendingCropFile: File | null = null;

  @ViewChild('cropImageRef') cropImageRef?: ElementRef<HTMLImageElement>;

  private readonly passwordSub: Subscription;
  private readonly confirmPasswordSub: Subscription;

  readonly signUpForm = new FormGroup(
    {
      profilePicture: new FormControl<File | null>(null, {
        validators: [Validators.required],
      }),
      firstName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
      lastName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          passwordStrengthValidator,
        ],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      acceptTerms: new FormControl(false, {
        nonNullable: true,
        validators: [Validators.requiredTrue],
      }),
    },
    { validators: passwordsMatchValidator },
  );

  constructor(private readonly cdr: ChangeDetectorRef) {
    // Keep mismatch errors in sync when password changes
    this.passwordSub = this.signUpForm.controls.password.valueChanges.subscribe(() => {
      this.syncPasswordMismatch();
    });

    // Keep mismatch errors in sync when confirmPassword changes
    this.confirmPasswordSub = this.signUpForm.controls.confirmPassword.valueChanges.subscribe(() => {
      this.syncPasswordMismatch();
    });
  }
onCropImageLoad(event: Event): void {
  const img = event.target as HTMLImageElement;

  if (!img.naturalWidth || !img.naturalHeight) {
    return;
  }

  const viewportSize = 240;

  // Fit the image to cover the square crop viewport.
  const scale = Math.max(
    viewportSize / img.naturalWidth,
    viewportSize / img.naturalHeight,
  );

  this.cropImageWidth = img.naturalWidth * scale;
  this.cropImageHeight = img.naturalHeight * scale;

  this.cdr.detectChanges();
}
  private syncPasswordMismatch(): void {
    const confirmCtrl = this.signUpForm.controls.confirmPassword;
    const passwordVal = this.signUpForm.controls.password.value;
    const confirmVal = confirmCtrl.value;

    const existingErrors = confirmCtrl.errors ? { ...confirmCtrl.errors } : null;

    if (confirmVal && passwordVal && confirmVal !== passwordVal) {
      confirmCtrl.setErrors({ ...existingErrors, passwordMismatch: true });
    } else if (existingErrors && existingErrors['passwordMismatch']) {
      delete existingErrors['passwordMismatch'];
      confirmCtrl.setErrors(Object.keys(existingErrors).length > 0 ? existingErrors : null);
    }
  }

  ngOnDestroy(): void {
    this.passwordSub?.unsubscribe();
    this.confirmPasswordSub?.unsubscribe();
  }

  get profilePicture() {
    return this.signUpForm.controls.profilePicture;
  }

  get firstName() {
    return this.signUpForm.controls.firstName;
  }

  get lastName() {
    return this.signUpForm.controls.lastName;
  }

  get email() {
    return this.signUpForm.controls.email;
  }

  get password() {
    return this.signUpForm.controls.password;
  }

  get confirmPassword() {
    return this.signUpForm.controls.confirmPassword;
  }

  get acceptTerms() {
    return this.signUpForm.controls.acceptTerms;
  }

  get isProfilePictureInvalid(): boolean {
    return (
      (this.profilePicture.touched || this.profilePicture.dirty) &&
      (this.profilePicture.invalid || !!this.profilePicError)
    );
  }

  get profilePictureErrorMessage(): string {
    if (this.profilePicError) {
      return this.profilePicError;
    }
    if (this.profilePicture.hasError('required')) {
      return 'Please upload a profile picture.';
    }
    if (this.profilePicture.hasError('invalidFileType')) {
      return 'Only JPG, PNG, WEBP, or GIF images are accepted.';
    }
    if (this.profilePicture.hasError('fileTooLarge')) {
      return 'Image size must not exceed 5 MB.';
    }
    return 'Invalid profile picture.';
  }

  onProfilePicSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.processProfilePicture(file);
    // Reset file input value so selecting the same file again triggers change event
    input.value = '';
  }

  processProfilePicture(file: File): void {
    this.profilePicture.markAsTouched();
    this.profilePicture.markAsDirty();
    this.profilePicError = null;

    if (!this.allowedProfilePicTypes.includes(file.type)) {
      this.profilePicture.setValue(null);
      this.profilePicture.setErrors({ invalidFileType: true });
      this.profilePicPreview = null;
      this.profilePicFileName = null;
      this.profilePicError = 'Only JPG, PNG, WEBP, or GIF images are accepted.';
      this.cdr.detectChanges();
      return;
    }

    if (file.size > this.maxProfilePicSizeBytes) {
      this.profilePicture.setValue(null);
      this.profilePicture.setErrors({ fileTooLarge: true });
      this.profilePicPreview = null;
      this.profilePicFileName = null;
      this.profilePicError = 'Image size must not exceed 5 MB.';
      this.cdr.detectChanges();
      return;
    }

    this.pendingCropFile = file;
    this.profilePicFileName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.rawImageSrc = dataUrl;
      this.openCropper(dataUrl);
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  openCropper(imageSrc?: string): void {
    if (imageSrc) {
      this.rawImageSrc = imageSrc;
    } else if (!this.rawImageSrc && this.profilePicPreview) {
      this.rawImageSrc = this.profilePicPreview;
    }

    if (!this.rawImageSrc) {
      return;
    }

    this.cropZoom = 1;
    this.cropPanX = 0;
    this.cropPanY = 0;
    this.isCropModalOpen = true;
    this.cdr.detectChanges();
  }

  closeCropper(): void {
    this.isCropModalOpen = false;
    // If no picture was ever saved and user cancels first upload, keep required error
    if (!this.profilePicPreview) {
      this.profilePicture.setValue(null);
      this.profilePicture.setErrors({ required: true });
      this.profilePicFileName = null;
    }
    this.cdr.detectChanges();
  }

  onZoomChange(newZoom: number): void {
    this.cropZoom = Math.max(1, Math.min(3, newZoom));
    this.cdr.detectChanges();
  }

  startCropDrag(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    this.isDraggingCrop = true;
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    this.dragStartX = clientX;
    this.dragStartY = clientY;
    this.initialPanX = this.cropPanX;
    this.initialPanY = this.cropPanY;
  }

  onCropDrag(event: MouseEvent | TouchEvent): void {
    if (!this.isDraggingCrop) {
      return;
    }
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const deltaX = clientX - this.dragStartX;
    const deltaY = clientY - this.dragStartY;

    // Limit pan bounds so user doesn't drag the image off-screen
    const maxPan = 140 * this.cropZoom;
    this.cropPanX = Math.max(-maxPan, Math.min(maxPan, this.initialPanX + deltaX));
    this.cropPanY = Math.max(-maxPan, Math.min(maxPan, this.initialPanY + deltaY));
    this.cdr.detectChanges();
  }

  stopCropDrag(): void {
    this.isDraggingCrop = false;
  }


applyCrop(): void {
  if (!this.rawImageSrc) {
    return;
  }

  const img = new Image();

  const performCanvasCrop = () => {
    try {
      const outputSize = 400;
      const cropViewportSize = 240;

      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        this.fallbackApplyRaw();
        return;
      }

      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

      if (!naturalWidth || !naturalHeight) {
        this.fallbackApplyRaw();
        return;
      }

      // Fit the image to cover the square crop viewport.
      const baseScale = Math.max(
        cropViewportSize / naturalWidth,
        cropViewportSize / naturalHeight,
      );

      const displayedWidth = naturalWidth * baseScale * this.cropZoom;
      const displayedHeight = naturalHeight * baseScale * this.cropZoom;

      // Position the image using the same pan values as the crop UI.
      const displayedLeft =
        (cropViewportSize - displayedWidth) / 2 + this.cropPanX;
      const displayedTop =
        (cropViewportSize - displayedHeight) / 2 + this.cropPanY;

      // Convert viewport coordinates into output canvas coordinates.
      const outputScale = outputSize / cropViewportSize;

      ctx.drawImage(
        img,
        displayedLeft * outputScale,
        displayedTop * outputScale,
        displayedWidth * outputScale,
        displayedHeight * outputScale,
      );

      const mimeType = ['image/jpeg', 'image/png', 'image/webp'].includes(
        this.pendingCropFile?.type ?? '',
      )
        ? this.pendingCropFile!.type
        : 'image/jpeg';

      const croppedDataUrl = canvas.toDataURL(mimeType, 0.92);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            this.fallbackApplyRaw();
            return;
          }

          const extension =
            mimeType === 'image/png'
              ? 'png'
              : mimeType === 'image/webp'
                ? 'webp'
                : 'jpg';

          const finalFile = new File(
            [blob],
            `profile-picture.${extension}`,
            { type: mimeType },
          );

          this.profilePicture.setValue(finalFile);
          this.profilePicture.updateValueAndValidity();
          this.profilePicError = null;
          this.profilePicPreview = croppedDataUrl;
          this.isCropModalOpen = false;
          this.cdr.detectChanges();
        },
        mimeType,
        0.92,
      );
    } catch {
      this.fallbackApplyRaw();
    }
  };

  img.onload = performCanvasCrop;

  img.onerror = () => {
    this.fallbackApplyRaw();
  };

  img.src = this.rawImageSrc;
}

  private fallbackApplyRaw(): void {
    if (this.rawImageSrc) {
      const fileToSet =
        this.pendingCropFile ||
        new File(['image-bytes'], this.profilePicFileName || 'avatar.jpg', {
          type: 'image/jpeg',
        });
      this.profilePicture.setValue(fileToSet);
      this.profilePicture.setErrors(null);
      this.profilePicPreview = this.rawImageSrc;
    }
    this.isCropModalOpen = false;
    this.cdr.detectChanges();
  }

  openPreviewModal(): void {
    if (this.profilePicPreview) {
      this.isViewModalOpen = true;
      this.cdr.detectChanges();
    }
  }

  closePreviewModal(): void {
    this.isViewModalOpen = false;
    this.cdr.detectChanges();
  }

  removeProfilePicture(fileInput?: HTMLInputElement): void {
    this.profilePicture.setValue(null);
    this.profilePicture.setErrors({ required: true });
    this.profilePicture.markAsTouched();
    this.profilePicture.markAsDirty();
    this.profilePicPreview = null;
    this.profilePicFileName = null;
    this.profilePicError = null;
    this.rawImageSrc = null;
    this.pendingCropFile = null;
    this.isViewModalOpen = false;
    this.isCropModalOpen = false;

    if (fileInput) {
      fileInput.value = '';
    }
    this.cdr.detectChanges();
  }

  get passwordsDoNotMatch(): boolean {
    const isTouchedOrDirty = this.confirmPassword.touched || this.confirmPassword.dirty;
    return (
      (this.signUpForm.hasError('passwordMismatch') || this.confirmPassword.hasError('passwordMismatch')) &&
      isTouchedOrDirty
    );
  }

  get isPasswordInvalid(): boolean {
    return this.password.touched && this.password.invalid;
  }

  onSubmit(): void {
    this.signUpForm.markAllAsTouched();
    this.syncPasswordMismatch();
    this.statusMessage = '';

    if (this.signUpForm.invalid || this.profilePicError) {
      return;
    }

    this.statusMessage =
      'Your details pass validation. Account creation will be available after Auth0 integration.';
  }
}