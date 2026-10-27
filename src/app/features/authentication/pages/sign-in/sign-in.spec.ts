
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { SignIn } from './sign-in';
import { provideRouter } from '@angular/router';

describe('SignIn', () => {
beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [SignIn],
    providers: [provideRouter([])],
  }).compileComponents();
});

  it('should create the sign-in component', () => {
    const fixture = TestBed.createComponent(SignIn);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the sign-in heading', () => {
    const fixture = TestBed.createComponent(SignIn);
    fixture.detectChanges();

    const heading: HTMLElement | null =
      fixture.nativeElement.querySelector('.form-heading h2');

    expect(heading?.textContent).toContain('Sign in to ResolveHQ');
  });

  it('should mark fields as touched when submitted empty', () => {
    const fixture = TestBed.createComponent(SignIn);
    const component = fixture.componentInstance;

    component.onSubmit();

    expect(component.email.touched).toBe(true);
    expect(component.password.touched).toBe(true);
    expect(component.statusMessage).toBe('');
  });

  it('should reject an invalid email address', () => {
    const fixture = TestBed.createComponent(SignIn);
    const component = fixture.componentInstance;

    component.email.setValue('not-an-email');

    expect(component.email.hasError('email')).toBe(true);
    expect(component.signInForm.invalid).toBe(true);
  });

  it('should toggle password visibility', () => {
    const fixture = TestBed.createComponent(SignIn);
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

  it('should show a placeholder message for valid details without signing in', () => {
    const fixture = TestBed.createComponent(SignIn);
    const component = fixture.componentInstance;

    component.signInForm.setValue({
      email: 'alex@example.com',
      password: 'ExamplePassword123!',
    });

    component.onSubmit();

    expect(component.signInForm.valid).toBe(true);
    expect(component.statusMessage).toContain('after Auth0 integration');
  });

  it('should include navigation links for forgot password and sign-up', () => {
    const fixture = TestBed.createComponent(SignIn);
    fixture.detectChanges();

    const links: NodeListOf<HTMLAnchorElement> =
      fixture.nativeElement.querySelectorAll('a');

    expect(
      Array.from(links).some(
        (link) => link.getAttribute('routerLink') === '/auth/forgot-password',
      ),
    ).toBe(true);

    expect(
      Array.from(links).some(
        (link) => link.getAttribute('routerLink') === '/auth/sign-up',
      ),
    ).toBe(true);
  });
});
