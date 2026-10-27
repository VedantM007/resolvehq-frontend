import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';

type AppTheme = 'light' | 'dark';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'resolvehq-theme';
  readonly currentYear = new Date().getFullYear();
  theme: AppTheme = 'light';

  constructor() {
    try {
      const savedTheme = localStorage.getItem(this.storageKey);

      if (savedTheme === 'light' || savedTheme === 'dark') {
        this.theme = savedTheme;
      }
    } catch {
      // The app still works when browser storage is unavailable.
    }

    this.applyTheme();
  }

  toggleTheme(): void {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme();

    try {
      localStorage.setItem(this.storageKey, this.theme);
    } catch {
      // The theme remains usable for the current session.
    }
  }

  private applyTheme(): void {
    this.document.documentElement.setAttribute('data-theme', this.theme);
  }
}