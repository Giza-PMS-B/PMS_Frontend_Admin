import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="language-switcher">
      <button 
        class="language-btn" 
        (click)="toggleLanguage()"
        [title]="'COMMON.LANGUAGE' | translate">
        <span class="language-icon">🌐</span>
        <span class="language-text">{{ getCurrentLanguageDisplay() }}</span>
      </button>
    </div>
  `,
  styleUrl: './language-switcher.component.scss'
})
export class LanguageSwitcherComponent {
  
  constructor(private languageService: LanguageService) {}

  toggleLanguage() {
    this.languageService.toggleLanguage();
  }

  getCurrentLanguageDisplay(): string {
    const currentLang = this.languageService.getCurrentLanguage();
    return currentLang === 'en' ? 'العربية' : 'English';
  }
}