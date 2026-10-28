import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { SignUp } from './sign-up';

describe('SignUp', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUp],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the sign-up component', () => {
    const fixture = TestBed.createComponent(SignUp);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the registration heading', () => {
    const fixture = TestBed.createComponent(SignUp);
    fixture.detectChanges();

    const heading: HTMLElement | null =
      fixture.nativeElement.querySelector('.form-heading h2');

    expect(heading?.textContent).toContain('Create your account');
  });

  it('should mark required fields including profile picture as touched on submit', () => {
    const fixture = TestBed.createComponent(SignUp);
    const component = fixture.componentInstance;

    component.onSubmit();

    expect(component.profilePicture.touched).toBe(true);
    expect(component.profilePicture.hasError('required')).toBe(true);
    expect(component.firstName.touched).toBe(true);
    expect(component.lastName.touched).toBe(true);
    expect(component.email.touched).toBe(true);
    expect(component.password.touched).toBe(true);
    expect(component.confirmPassword.touched).toBe(true);
    expect(component.acceptTerms.touched).toBe(true);
    expect(component.statusMessage).toBe('');
  });

  it('should reject non-image file types for profile picture', () => {
    const fixture = TestBed.createComponent(SignUp);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const pdfFile = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });
    component.processProfilePicture(pdfFile);
    fixture.detectChanges();

    expect(component.profilePicture.hasError('invalidFileType')).toBe(true);
    expect(component.profilePicture.value).toBeNull();
    expect(component.profilePicPreview).toBeNull();
    expect(component.profilePictureErrorMessage).toBe('Only JPG, PNG, WEBP, or GIF images are accepted.');

    const errorEl = fixture.nativeElement.querySelector('#profile-error');
    expect(errorEl?.textContent).toContain('Only JPG, PNG, WEBP, or GIF images are accepted.');
  });

  it('should reject files exceeding 5MB for profile picture', () => {
    const fixture = TestBed.createComponent(SignUp);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Create a 6MB dummy file
    const oversizedFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'avatar-large.png', {
      type: 'image/png',
    });
    component.processProfilePicture(oversizedFile);
    fixture.detectChanges();

    expect(component.profilePicture.hasError('fileTooLarge')).toBe(true);
    expect(component.profilePicture.value).toBeNull();
    expect(component.profilePicPreview).toBeNull();
    expect(component.profilePictureErrorMessage).toBe('Image size must not exceed 5 MB.');

    const errorEl = fixture.nativeElement.querySelector('#profile-error');
    expect(errorEl?.textContent).toContain('Image size must not exceed 5 MB.');
  });

  it('should immediately update preview upon file selection without other field interaction', async () => {
    const fixture = TestBed.createComponent(SignUp);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const mockDataUrl = 'data:image/png;base64,immediatepreviewdata';
    const originalFileReader = globalThis.FileReader;
    class MockFileReader {
      result: string | null = null;
      onload: (() => void) | null = null;
      readAsDataURL() {
        this.result = mockDataUrl;
        Promise.resolve().then(() => {
          this.onload?.();
        });
      }
    }
    (globalThis as unknown as { FileReader: unknown }).FileReader = MockFileReader;

    try {
      const testFile = new File(['file-bits'], 'test-avatar.png', { type: 'image/png' });

      // Directly process file as triggered by onProfilePicSelected
      component.processProfilePicture(testFile);

      await Promise.resolve();
      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();

      // Immediately opens cropper with loaded image preview
      expect(component.isCropModalOpen).toBe(true);
      expect(component.rawImageSrc).toBe(mockDataUrl);
      expect(fixture.nativeElement.querySelector('.crop-dialog')).toBeTruthy();

      // Apply crop
      component.applyCrop();
      await Promise.resolve();
      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();

      expect(component.profilePicPreview).toBeTruthy();
      const previewImg: HTMLImageElement | null = fixture.nativeElement.querySelector('.avatar-preview-img');
      expect(previewImg).toBeTruthy();
      expect(component.profilePicture.valid).toBe(true);
    } finally {
      (globalThis as unknown as { FileReader: unknown }).FileReader = originalFileReader;
    }
  });

  it('should open large preview modal when clicking avatar preview and allow closing', () => {
    const fixture = TestBed.createComponent(SignUp);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.profilePicPreview = 'data:image/png;base64,largepreview';
    component.profilePicFileName = 'avatar.png';
    fixture.detectChanges();

    expect(component.isViewModalOpen).toBe(false);
    expect(fixture.nativeElement.querySelector('.preview-dialog')).toBeNull();

    const avatarBtn: HTMLElement = fixture.nativeElement.querySelector('.avatar-preview-wrapper');
    avatarBtn.click();
    fixture.detectChanges();

    expect(component.isViewModalOpen).toBe(true);
    const dialog = fixture.nativeElement.querySelector('.preview-dialog');
    expect(dialog).toBeTruthy();
    expect(dialog?.textContent).toContain('Profile Picture Preview');

    component.closePreviewModal();
    fixture.detectChanges();

    expect(component.isViewModalOpen).toBe(false);
    expect(fixture.nativeElement.querySelector('.preview-dialog')).toBeNull();
  });

  it('should support cropping with zoom adjustment, panning, and cancel/apply', async () => {
    const fixture = TestBed.createComponent(SignUp);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.rawImageSrc = 'data:image/png;base64,rawimage';
    component.openCropper();
    fixture.detectChanges();

    expect(component.isCropModalOpen).toBe(true);
    expect(component.cropZoom).toBe(1);

    // Zoom adjust
    component.onZoomChange(1.8);
    expect(component.cropZoom).toBe(1.8);

    // Pan adjust
    component.cropPanX = 15;
    component.cropPanY = -10;
    expect(component.cropPanX).toBe(15);
    expect(component.cropPanY).toBe(-10);

    // Cancel cropper
    component.closeCropper();
    fixture.detectChanges();
    expect(component.isCropModalOpen).toBe(false);

    // Open cropper again and apply
    component.openCropper();
    fixture.detectChanges();
    expect(component.isCropModalOpen).toBe(true);

    // In unit test environment, simulate image decode onload
    const origImage = globalThis.Image;
    class TestImage {
      width = 200;
      height = 200;
      naturalWidth = 200;
      naturalHeight = 200;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_val: string) {
        Promise.resolve().then(() => this.onload?.());
      }
    }
    (globalThis as unknown as { Image: unknown }).Image = TestImage;

    try {
      component.applyCrop();
      await Promise.resolve();
      await new Promise((resolve) => setTimeout(resolve, 20));
      fixture.detectChanges();

      expect(component.profilePicPreview).toBeTruthy();
    } finally {
      (globalThis as unknown as { Image: unknown }).Image = origImage;
    }
  });

  it('should update mismatch state when password changes', () => {
    const fixture = TestBed.createComponent(SignUp);
    const component = fixture.componentInstance;

    component.password.setValue('StrongPass123!');
    component.confirmPassword.setValue('StrongPass123!');
    component.confirmPassword.markAsTouched();

    expect(component.passwordsDoNotMatch).toBe(false);

    component.password.setValue('ChangedPass123!');
    expect(component.passwordsDoNotMatch).toBe(true);

    component.confirmPassword.setValue('ChangedPass123!');
    expect(component.passwordsDoNotMatch).toBe(false);
  });

  it('should enforce password rules (8+ chars, uppercase, special char, number) and render error only when touched & invalid', () => {
    const fixture = TestBed.createComponent(SignUp);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isPasswordInvalid).toBe(false);
    expect(fixture.nativeElement.querySelector('#password-error')).toBeNull();

    component.password.setValue('Password123');
    component.password.markAsTouched();
    fixture.detectChanges();

    expect(component.isPasswordInvalid).toBe(true);
    const errorEl = fixture.nativeElement.querySelector('#password-error');

    expect(errorEl?.textContent).toContain(
      'Password must be at least 8 characters long. Password must contain at least one uppercase letter, one special character, and one number.',
    );

    component.password.setValue('Password!@#');
    expect(component.password.invalid).toBe(true);

    component.password.setValue('password123!');
    expect(component.password.invalid).toBe(true);

    component.password.setValue('Pass1!');
    expect(component.password.invalid).toBe(true);

    component.password.setValue('StrongPass123!');
    fixture.detectChanges();

    expect(component.password.valid).toBe(true);
    expect(component.isPasswordInvalid).toBe(false);
  });

  it('should toggle password visibility', () => {
    const fixture = TestBed.createComponent(SignUp);
    fixture.detectChanges();

    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('#password');

    const toggle: HTMLButtonElement =
      fixture.nativeElement.querySelector(
        'button[aria-label="Show password"]',
      );

    expect(input.type).toBe('password');

    toggle.click();
    fixture.detectChanges();

    expect(input.type).toBe('text');
  });

  it('should accept a valid form without pretending to create an account', () => {
    const fixture = TestBed.createComponent(SignUp);
    const component = fixture.componentInstance;

    const dummyFile = new File(['pic-bytes'], 'avatar.jpg', { type: 'image/jpeg' });

    component.signUpForm.setValue({
      profilePicture: dummyFile,
      firstName: 'Alex',
      lastName: 'Morgan',
      email: 'alex@example.com',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
      acceptTerms: true,
    });

    component.onSubmit();

    expect(component.signUpForm.valid).toBe(true);
    expect(component.statusMessage).toContain('after Auth0 integration');
  });

  it('should validate first name and last name requirements', () => {
    const fixture = TestBed.createComponent(SignUp);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.firstName.hasError('required')).toBe(true);
    expect(component.lastName.hasError('required')).toBe(true);

    component.firstName.setValue('A');
    expect(component.firstName.hasError('minlength')).toBe(true);

    component.lastName.setValue('B');
    expect(component.lastName.hasError('minlength')).toBe(true);

    component.firstName.setValue('Alex');
    component.lastName.setValue('Morgan');

    expect(component.firstName.valid).toBe(true);
    expect(component.lastName.valid).toBe(true);
  });
});