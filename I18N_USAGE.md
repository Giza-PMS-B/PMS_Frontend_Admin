# i18n Translation System Usage Guide

## Overview
This application uses `@ngx-translate` for internationalization (i18n) support, providing English and Arabic translations.

## Features
- ✅ English and Arabic language support
- ✅ RTL (Right-to-Left) support for Arabic
- ✅ Language persistence (saved in localStorage)
- ✅ Easy language switching with a button
- ✅ Automatic document direction change

## How to Use Translations in Components

### 1. Import TranslatePipe
```typescript
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  // ...
})
```

### 2. Use in Templates
```html
<!-- Simple translation -->
<h1>{{ 'ADMIN.PORTAL' | translate }}</h1>

<!-- Translation with parameters -->
<p>{{ 'VALIDATION.MIN_LENGTH' | translate: {min: 3} }}</p>

<!-- Translation in attributes -->
<button [title]="'COMMON.SAVE' | translate">Save</button>
```

### 3. Use in TypeScript Code
```typescript
import { TranslateService } from '@ngx-translate/core';

constructor(private translate: TranslateService) {}

someMethod() {
  // Get translation
  const message = this.translate.instant('MESSAGES.SITE_CREATED');
  
  // Get translation with parameters
  const minLength = this.translate.instant('VALIDATION.MIN_LENGTH', { min: 3 });
}
```

## Translation Files Structure

### English (en.json)
```json
{
  "COMMON": {
    "SAVE": "Save",
    "CANCEL": "Cancel"
  },
  "ADMIN": {
    "PORTAL": "Admin Portal"
  }
}
```

### Arabic (ar.json)
```json
{
  "COMMON": {
    "SAVE": "حفظ",
    "CANCEL": "إلغاء"
  },
  "ADMIN": {
    "PORTAL": "بوابة الإدارة"
  }
}
```

## Language Switcher Component

The `LanguageSwitcherComponent` is already integrated in the admin dashboard header.

### Usage in Other Components
```html
<app-language-switcher></app-language-switcher>
```

## Language Service

### Methods Available
```typescript
import { LanguageService } from './services/language.service';

constructor(private languageService: LanguageService) {}

// Get current language
const currentLang = this.languageService.getCurrentLanguage(); // 'en' or 'ar'

// Check if RTL
const isRTL = this.languageService.getIsRTL(); // true or false

// Set specific language
this.languageService.setLanguage('ar');

// Toggle between languages
this.languageService.toggleLanguage();

// Get available languages
const languages = this.languageService.getAvailableLanguages();
```

## Adding New Translations

1. Add the key to both `en.json` and `ar.json`:

**en.json:**
```json
{
  "NEW_SECTION": {
    "NEW_KEY": "New English Text"
  }
}
```

**ar.json:**
```json
{
  "NEW_SECTION": {
    "NEW_KEY": "نص عربي جديد"
  }
}
```

2. Use in your component:
```html
<p>{{ 'NEW_SECTION.NEW_KEY' | translate }}</p>
```

## RTL Support

The application automatically switches to RTL mode when Arabic is selected:
- Document direction changes to `rtl`
- CSS automatically adjusts for RTL layout
- All flex layouts reverse direction

### CSS for RTL-specific styles
```scss
.my-element {
  margin-left: 1rem;
}

[dir="rtl"] .my-element {
  margin-left: 0;
  margin-right: 1rem;
}
```

## Current Translation Coverage

- ✅ Admin Dashboard
- ✅ Site Management Forms
- ✅ Polygon Forms
- ✅ Validation Messages
- ✅ Success/Error Messages
- ✅ Site Details
- ✅ Common UI Elements

## Testing

1. Start the application
2. Click the language switcher button in the header
3. Verify all text changes to the selected language
4. Verify RTL layout for Arabic
5. Refresh the page - language should persist

## Notes

- Language preference is saved in localStorage
- Default language is English
- The system automatically detects and applies RTL for Arabic
- All validation messages are translated
- Form labels and buttons are translated
