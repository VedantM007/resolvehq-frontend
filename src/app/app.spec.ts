import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { App } from './app';

describe('App', () => {
  it('should create the app', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the router outlet', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const outlet = fixture.nativeElement.querySelector('router-outlet');

    expect(outlet).not.toBeNull();
  });
});