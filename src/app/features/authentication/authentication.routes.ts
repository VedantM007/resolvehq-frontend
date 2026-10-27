import { Routes } from '@angular/router';

export const AUTHENTICATION_ROUTES: Routes = [
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./pages/sign-up/sign-up').then((m) => m.SignUp),
  },
];