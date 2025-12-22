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

  /**
   * Translate backend error messages to appropriate translation keys
   * @param backendMessage - The error message from backend
   * @returns Translated message or original message if no translation found
   */
  translateBackendError(backendMessage: string): string {
    // Map of backend error messages to translation keys
    const errorMappings: { [key: string]: string } = {
      'The site name is already existed': 'VALIDATION.SITE_NAME_EXISTS',
      'integration code already existed': 'VALIDATION.INTEGRATION_CODE_ALREADY_EXISTS',
      'Integration code already existed': 'VALIDATION.INTEGRATION_CODE_ALREADY_EXISTS',
      'Site name already exists': 'VALIDATION.SITE_NAME_EXISTS',
      'Integration Code Already Exists': 'VALIDATION.INTEGRATION_CODE_EXISTS',
      'These Values are already exists': 'VALIDATION.VALUES_ALREADY_EXISTS' // Backend sends this for both site name and integration code
    };

    // Check if we have a translation for this error message
    const translationKey = errorMappings[backendMessage];
    if (translationKey) {
      const translatedMessage = this.translate.instant(translationKey);
      console.log(`Backend error translated: "${backendMessage}" -> "${translatedMessage}"`);
      return translatedMessage;
    }

    // Log unmatched messages for debugging
    console.log(`Unmatched backend error message: "${backendMessage}"`);
    
    // Return original message if no translation found
    return backendMessage;
  }
}