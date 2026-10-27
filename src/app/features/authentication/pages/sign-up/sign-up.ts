import { Component, OnDestroy } from '@angular/core';
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

  private readonly passwordSub: Subscription;
  private readonly confirmPasswordSub: Subscription;

  readonly signUpForm = new FormGroup(
    {
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

  constructor() {
    // Keep mismatch errors in sync when password changes
    this.passwordSub = this.signUpForm.controls.password.valueChanges.subscribe(() => {
      this.syncPasswordMismatch();
    });

    // Keep mismatch errors in sync when confirmPassword changes
    this.confirmPasswordSub = this.signUpForm.controls.confirmPassword.valueChanges.subscribe(() => {
      this.syncPasswordMismatch();
    });
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

    if (this.signUpForm.invalid) {
      return;
    }

    this.statusMessage =
      'Your details pass validation. Account creation will be available after Auth0 integration.';
  }
}