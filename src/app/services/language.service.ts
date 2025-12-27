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
    // Log the original message for debugging
    console.log(`Original backend error message: "${backendMessage}"`);
    
    // Normalize the message by trimming whitespace and converting to lowercase for comparison
    const normalizedMessage = backendMessage.trim().toLowerCase();
    console.log(`Normalized message: "${normalizedMessage}"`);
    
    // Map of backend error messages to translation keys (using lowercase for comparison)
    const errorMappings: { [key: string]: string } = {
      'the site name is already existed': 'VALIDATION.SITE_NAME_EXISTS',
      'integration code already existed': 'VALIDATION.INTEGRATION_CODE_ALREADY_EXISTS',
      'site name already exists': 'VALIDATION.SITE_NAME_EXISTS',
      'integration code already exists': 'VALIDATION.INTEGRATION_CODE_EXISTS',
      'these values are already exists': 'VALIDATION.VALUES_ALREADY_EXISTS',
      'these values are already exist': 'VALIDATION.VALUES_ALREADY_EXISTS', // Handle grammar variations
      'values are already exists': 'VALIDATION.VALUES_ALREADY_EXISTS',
      'values already exist': 'VALIDATION.VALUES_ALREADY_EXISTS',
      'a site with the same name already exists at this level': 'VALIDATION.SITE_NAME_EXISTS_AT_LEVEL',
      'site name cannot be the same as its parent name': 'VALIDATION.SITE_NAME_SAME_AS_PARENT'
    };

    // Check if we have a translation for this error message
    const translationKey = errorMappings[normalizedMessage];
    if (translationKey) {
      const translatedMessage = this.translate.instant(translationKey);
      console.log(`Backend error translated: "${backendMessage}" -> "${translatedMessage}" (using key: ${translationKey})`);
      return translatedMessage;
    }

    // Log unmatched messages for debugging
    console.log(`Unmatched backend error message: "${backendMessage}" (normalized: "${normalizedMessage}")`);
    console.log('Available mappings:', Object.keys(errorMappings));
    
    // Return original message if no translation found
    return backendMessage;
  }
}