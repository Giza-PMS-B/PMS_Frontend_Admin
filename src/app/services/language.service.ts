import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguage = signal<string>('en');
  private isRTL = signal<boolean>(false);

  constructor(private translate: TranslateService) {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem('app-language') || 'en';
    this.setLanguage(savedLang);
  }

  getCurrentLanguage() {
    return this.currentLanguage();
  }

  getIsRTL() {
    return this.isRTL();
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLanguage.set(lang);
    this.isRTL.set(lang === 'ar');
    
    // Save to localStorage
    localStorage.setItem('app-language', lang);
    
    // Update document direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }

  toggleLanguage() {
    const newLang = this.currentLanguage() === 'en' ? 'ar' : 'en';
    this.setLanguage(newLang);
  }

  getAvailableLanguages() {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' }
    ];
  }
}