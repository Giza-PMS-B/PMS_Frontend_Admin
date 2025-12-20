import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, TranslatePipe, LanguageSwitcherComponent],
  template: `
    <div class="welcome-container" [class.sliding-out]="isSliding()">
      <div class="background-overlay"></div>
      
      <header class="welcome-header">
        <div class="header-content">
          <img src="assets/logo5.png" alt="Logo" class="welcome-logo">
          <app-language-switcher></app-language-switcher>
        </div>
      </header>

      <div class="welcome-content">
        <div class="hero-section">
          <div class="hero-text">
            <h1 class="welcome-title">{{ 'WELCOME.TITLE' | translate }}</h1>
            <p class="welcome-subtitle">{{ 'WELCOME.SUBTITLE' | translate }}</p>
            <p class="welcome-description">{{ 'WELCOME.DESCRIPTION' | translate }}</p>
          </div>
          
          <div class="hero-actions">
            <button 
              class="get-started-btn" 
              (click)="onGetStarted()"
              [disabled]="isSliding()">
              <img src="assets/start.png" alt="Start" class="btn-icon-img">
              <span class="btn-text">{{ 'WELCOME.GET_STARTED' | translate }}</span>
              <span class="btn-arrow">→</span>
            </button>
          </div>
        </div>

        <div class="features-section">
          <div class="feature-card">
            <img src="assets/card11.png" alt="Site Management" class="feature-icon-img">
            <h3>{{ 'WELCOME.FEATURE_1_TITLE' | translate }}</h3>
            <p>{{ 'WELCOME.FEATURE_1_DESC' | translate }}</p>
          </div>
          
          <div class="feature-card">
            <img src="assets/polygon.png" alt="Polygon Configuration" class="feature-icon-img">
            <h3>{{ 'WELCOME.FEATURE_2_TITLE' | translate }}</h3>
            <p>{{ 'WELCOME.FEATURE_2_DESC' | translate }}</p>
          </div>
          
          <div class="feature-card">
            <img src="assets/monitoring.png" alt="Real-time Control" class="feature-icon-img">
            <h3>{{ 'WELCOME.FEATURE_3_TITLE' | translate }}</h3>
            <p>{{ 'WELCOME.FEATURE_3_DESC' | translate }}</p>
          </div>
        </div>
      </div>

      <footer class="welcome-footer">
        <p>{{ 'WELCOME.FOOTER_TEXT' | translate }}</p>
      </footer>
    </div>
  `,
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent implements OnInit {
  isSliding = signal<boolean>(false);

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Add entrance animation
    setTimeout(() => {
      document.querySelector('.welcome-container')?.classList.add('loaded');
    }, 100);
  }

  onGetStarted(): void {
    this.isSliding.set(true);
    
    // Wait for slide animation to complete before navigating
    setTimeout(() => {
      this.router.navigate(['/admin']);
    }, 800);
  }
}