import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/authentication/authentication.routes').then(
        (m) => m.AUTHENTICATION_ROUTES,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/sign-up',
  },
  {
    path: '**',
    redirectTo: 'auth/sign-up',
  },
];