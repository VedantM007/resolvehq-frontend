
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
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn {
  showPassword = false;
  statusMessage = '';

  readonly signInForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  get email() {
    return this.signInForm.controls.email;
  }

  get password() {
    return this.signInForm.controls.password;
  }

  onSubmit(): void {
    this.signInForm.markAllAsTouched();
    this.statusMessage = '';

    if (this.signInForm.invalid) {
      return;
    }

    this.statusMessage =
      'Your details are valid. Sign-in will be available after Auth0 integration.';
  }
}
