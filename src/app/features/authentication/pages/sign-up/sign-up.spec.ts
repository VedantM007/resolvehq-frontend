import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { SignUp } from './sign-up';

describe('SignUp', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUp],
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

  it('should mark required fields as touched on submit', () => {
    const fixture = TestBed.createComponent(SignUp);
    const component = fixture.componentInstance;

    component.onSubmit();

    expect(component.fullName.touched).toBe(true);
    expect(component.email.touched).toBe(true);
    expect(component.password.touched).toBe(true);
    expect(component.confirmPassword.touched).toBe(true);
    expect(component.acceptTerms.touched).toBe(true);
    expect(component.statusMessage).toBe('');
  });

  it('should reject passwords that do not match', () => {
    const fixture = TestBed.createComponent(SignUp);
    const component = fixture.componentInstance;

    component.password.setValue('StrongPass123!');
    component.confirmPassword.setValue('DifferentPass123!');

    expect(component.signUpForm.hasError('passwordMismatch')).toBe(true);
  });

  it('should update mismatch state when password changes', () => {
    const fixture = TestBed.createComponent(SignUp);
    const component = fixture.componentInstance;

    component.password.setValue('StrongPass123!');
    component.confirmPassword.setValue('StrongPass123!');
    component.confirmPassword.markAsTouched();

    expect(component.passwordsDoNotMatch).toBe(false);

    // Modify password, confirmPassword mismatch should update
    component.password.setValue('ChangedPass123!');
    expect(component.passwordsDoNotMatch).toBe(true);

    component.confirmPassword.setValue('ChangedPass123!');
    expect(component.passwordsDoNotMatch).toBe(false);
  });

  it('should enforce password rules (8+ chars, uppercase, special char, number) and render error only when touched & invalid', () => {
    const fixture = TestBed.createComponent(SignUp);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Not touched initially - no error rendered
    expect(component.isPasswordInvalid).toBe(false);
    expect(fixture.nativeElement.querySelector('#password-error')).toBeNull();

    // Invalid: missing special character
    component.password.setValue('Password123');
    component.password.markAsTouched();
    fixture.detectChanges();

    expect(component.isPasswordInvalid).toBe(true);
    const errorEl = fixture.nativeElement.querySelector('#password-error');
    expect(errorEl?.textContent).toContain(
      'Password must be at least 8 characters long. Password must contain at least one uppercase letter, one special character, and one number.',
    );

    // Invalid: missing number
    component.password.setValue('Password!@#');
    expect(component.password.invalid).toBe(true);

    // Invalid: missing uppercase
    component.password.setValue('password123!');
    expect(component.password.invalid).toBe(true);

    // Invalid: shorter than 8 chars
    component.password.setValue('Pass1!');
    expect(component.password.invalid).toBe(true);

    // Valid password
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

    component.signUpForm.setValue({
      fullName: 'Alex Morgan',
      email: 'alex@example.com',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
      acceptTerms: true,
    });

    component.onSubmit();

    expect(component.signUpForm.valid).toBe(true);
    expect(component.statusMessage).toContain('after Auth0 integration');
  });
});