
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  statusMessage = '';
  submittedEmail = '';

  readonly forgotPasswordForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  get email() {
    return this.forgotPasswordForm.controls.email;
  }

  onSubmit(): void {
    this.forgotPasswordForm.markAllAsTouched();
    this.statusMessage = '';

    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.submittedEmail = this.email.value;
    this.statusMessage =
      'Password reset instructions will be available after Auth0 integration.';
  }

  resetForm(): void {
    this.forgotPasswordForm.reset();
    this.submittedEmail = '';
    this.statusMessage = '';
  }
}
