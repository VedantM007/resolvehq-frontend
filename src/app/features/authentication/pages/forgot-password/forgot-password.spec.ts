
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { ForgotPassword } from './forgot-password';
describe('ForgotPassword', () => {
beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [ForgotPassword],
    providers: [provideRouter([])],
  }).compileComponents();
});

  it('should create the forgot-password component', () => {
    const fixture = TestBed.createComponent(ForgotPassword);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the recovery heading', () => {
    const fixture = TestBed.createComponent(ForgotPassword);
    fixture.detectChanges();

    const heading: HTMLElement | null =
      fixture.nativeElement.querySelector('.form-heading h2');

    expect(heading?.textContent).toContain('Forgot your password?');
  });

  it('should mark the email field as touched when submitted empty', () => {
    const fixture = TestBed.createComponent(ForgotPassword);
    const component = fixture.componentInstance;

    component.onSubmit();

    expect(component.email.touched).toBe(true);
    expect(component.statusMessage).toBe('');
  });

  it('should reject an invalid email address', () => {
    const fixture = TestBed.createComponent(ForgotPassword);
    const component = fixture.componentInstance;

    component.email.setValue('invalid-email');

    expect(component.email.hasError('email')).toBe(true);
    expect(component.forgotPasswordForm.invalid).toBe(true);
  });

  it('should show a placeholder confirmation for a valid email', () => {
    const fixture = TestBed.createComponent(ForgotPassword);
    const component = fixture.componentInstance;

    component.email.setValue('alex@example.com');
    component.onSubmit();

    expect(component.forgotPasswordForm.valid).toBe(true);
    expect(component.submittedEmail).toBe('alex@example.com');
    expect(component.statusMessage).toContain('after Auth0 integration');
  });

  it('should reset the form and confirmation state', () => {
    const fixture = TestBed.createComponent(ForgotPassword);
    const component = fixture.componentInstance;

    component.email.setValue('alex@example.com');
    component.onSubmit();
    component.resetForm();

    expect(component.email.value).toBe('');
    expect(component.submittedEmail).toBe('');
    expect(component.statusMessage).toBe('');
  });

  it('should link back to sign-in', () => {
    const fixture = TestBed.createComponent(ForgotPassword);
    fixture.detectChanges();

    const link: HTMLAnchorElement | null =
      fixture.nativeElement.querySelector(
        'a[routerLink="/auth/sign-in"]',
      );

    expect(link).not.toBeNull();
  });
});
