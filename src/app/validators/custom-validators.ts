import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { SiteService } from '../services/site.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export class CustomValidators {
  
  // Uniqueness validator for site names
  static uniqueSiteName(siteService: SiteService, excludeId?: string): ValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return siteService.getSites().pipe(
        map(sites => {
          const isDuplicate = this.checkNameUniqueness(sites, control.value, excludeId);
          return isDuplicate ? { uniqueName: { value: control.value } } : null;
        }),
        catchError(() => of(null))
      );
    };
  }

  // Uniqueness validator for integration code
  static uniqueIntegrationCode(siteService: SiteService, excludeId?: string): ValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return siteService.getSites().pipe(
        map(sites => {
          const isDuplicate = this.checkIntegrationCodeUniqueness(sites, control.value, excludeId);
          return isDuplicate ? { uniqueIntegrationCode: { value: control.value } } : null;
        }),
        catchError(() => of(null))
      );
    };
  }

  // Arabic text validator
  static arabicText(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.trim();

      // Check if empty after trimming
      if (!value) {
        return { arabicText: { value: control.value } };
      }

      // Check if contains only special characters (no letters or numbers)
      const hasLetterOrNumber = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF0-9]/.test(value);
      if (!hasLetterOrNumber) {
        return { arabicTextSpecialOnly: { value: control.value } };
      }

      // Allow numeric-only input or input with Arabic letters
      // Arabic characters, numbers, and only specific special characters: - _ space .
      const pattern = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF0-9\s\-_.]+$/;
      return pattern.test(value) ? null : { arabicText: { value: control.value } };
    };
  }

  // English text validator
  static englishText(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.trim();

      // Check if empty after trimming
      if (!value) {
        return { englishText: { value: control.value } };
      }

      // Check if contains only special characters (no letters or numbers)
      const hasLetterOrNumber = /[a-zA-Z0-9]/.test(value);
      if (!hasLetterOrNumber) {
        return { englishTextSpecialOnly: { value: control.value } };
      }

      // Allow numeric-only input or input with English letters
      // English letters, numbers, and only specific special characters: - _ space .
      const pattern = /^[a-zA-Z0-9\s\-_.]+$/;
      return pattern.test(value) ? null : { englishText: { value: control.value } };
    };
  }

  // Integration code format validator
  static integrationCodeFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.trim();

      // Check if empty after trimming or doesn't contain at least one alphanumeric character
      const hasAlphanumeric = /[a-zA-Z0-9]/.test(value);
      if (!value || !hasAlphanumeric) {
        return { integrationCodeFormat: { value: control.value } };
      }

      // Accepts letters, numbers, and only specific special characters: - _ space . |
      const pattern = /^[a-zA-Z0-9\s\-_.|]+$/;
      return pattern.test(value) ? null : { integrationCodeFormat: { value: control.value } };
    };
  }

  // Price format validator (up to 2 decimal places allowed)
  static priceFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) {
        return null;
      }
      
      const value = control.value.toString();
      
      // Check if it's a valid positive number
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        return { priceFormat: { value: control.value } };
      }
      
      // Allow integers and numbers with up to 2 decimal places (e.g., 5, 5.5, 5.50)
      const pattern = /^\d+(\.\d{1,2})?$/;
      return pattern.test(value) ? null : { priceFormat: { value: control.value } };
    };
  }

  // Latitude validator
  static latitude(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) {
        return null;
      }
      
      const inputValue = control.value.toString().trim();
      
      // Check if input contains only numbers, decimal point, and optional minus sign (no letters including 'e')
      const validFormatPattern = /^-?\d*\.?\d*$/;
      const hasLetters = /[a-zA-Z]/.test(inputValue);
      if (!validFormatPattern.test(inputValue) || hasLetters) {
        return { latitudeInvalidFormat: { value: control.value } };
      }
      
      // Check if it's empty after removing valid characters
      if (inputValue === '' || inputValue === '-' || inputValue === '.') {
        return null; // Let required validator handle empty values
      }
      
      const value = parseFloat(inputValue);
      if (isNaN(value)) {
        return { invalidLatitude: { value: control.value } };
      }
      
      if (value < -90 || value > 90) {
        return { latitudeRange: { value: control.value } };
      }
      
      // Check decimal places (up to 6)
      const decimalPlaces = (inputValue.split('.')[1] || '').length;
      if (decimalPlaces > 6) {
        return { latitudeDecimalPlaces: { value: control.value } };
      }
      
      return null;
    };
  }

  // Longitude validator
  static longitude(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) {
        return null;
      }
      
      const inputValue = control.value.toString().trim();
      
      // Check if input contains only numbers, decimal point, and optional minus sign (no letters including 'e')
      const validFormatPattern = /^-?\d*\.?\d*$/;
      const hasLetters = /[a-zA-Z]/.test(inputValue);
      if (!validFormatPattern.test(inputValue) || hasLetters) {
        return { longitudeInvalidFormat: { value: control.value } };
      }
      
      // Check if it's empty after removing valid characters
      if (inputValue === '' || inputValue === '-' || inputValue === '.') {
        return null; // Let required validator handle empty values
      }
      
      const value = parseFloat(inputValue);
      if (isNaN(value)) {
        return { invalidLongitude: { value: control.value } };
      }
      
      if (value < -180 || value > 180) {
        return { longitudeRange: { value: control.value } };
      }
      
      // Check decimal places (up to 6)
      const decimalPlaces = (inputValue.split('.')[1] || '').length;
      if (decimalPlaces > 6) {
        return { longitudeDecimalPlaces: { value: control.value } };
      }
      
      return null;
    };
  }

  // Mixed text validator (Arabic and English)
  static mixedText(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.trim();

      // Check if empty after trimming
      if (!value) {
        return { mixedText: { value: control.value } };
      }

      // Check if contains only special characters (no letters or numbers)
      const hasLetterOrNumber = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9]/.test(value);
      if (!hasLetterOrNumber) {
        return { mixedTextSpecialOnly: { value: control.value } };
      }

      // Allow numeric-only input or input with Arabic/English letters
      // Arabic and English characters, numbers, and only specific special characters: - _ space .
      const pattern = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s\-_.]+$/;
      return pattern.test(value) ? null : { mixedText: { value: control.value } };
    };
  }

  // Polygon name uniqueness validator
  static uniquePolygonName(siteService: SiteService, excludeId?: string): ValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return siteService.getSites().pipe(
        map(sites => {
          const isDuplicate = this.checkPolygonNameUniqueness(sites, control.value, excludeId);
          return isDuplicate ? { uniquePolygonName: { value: control.value } } : null;
        }),
        catchError(() => of(null))
      );
    };
  }

  // Duplicate coordinates validator for FormArray
  static noDuplicateCoordinates(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !Array.isArray(control.value)) {
        return null;
      }

      const coordinates = control.value;
      const coordinateStrings = new Set<string>();

      for (let i = 0; i < coordinates.length; i++) {
        const coord = coordinates[i];
        if (coord && coord.latitude !== null && coord.longitude !== null &&
            coord.latitude !== undefined && coord.longitude !== undefined) {

          // Create a string representation of the coordinate pair
          const coordString = `${coord.latitude},${coord.longitude}`;

          if (coordinateStrings.has(coordString)) {
            return { duplicateCoordinates: { message: 'Duplicate points are not allowed in the polygon' } };
          }

          coordinateStrings.add(coordString);
        }
      }

      return null;
    };
  }

  // Integer validator (no decimals allowed)
  static integer(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) {
        return null;
      }

      const value = control.value;

      // Check if value is a number
      if (isNaN(value)) {
        return { integer: { value: control.value } };
      }

      // Check if value is an integer (no decimal part)
      if (!Number.isInteger(Number(value))) {
        return { integer: { value: control.value } };
      }

      return null;
    };
  }

  // Helper methods
  private static checkNameUniqueness(sites: any[], name: string, excludeId?: string): boolean {
    const checkInSites = (siteList: any[]): boolean => {
      for (const site of siteList) {
        if (site.id !== excludeId && (site.nameEn === name || site.nameAr === name)) {
          return true;
        }
        if (site.children && site.children.length > 0) {
          if (checkInSites(site.children)) {
            return true;
          }
        }
      }
      return false;
    };
    
    return checkInSites(sites);
  }

  private static checkIntegrationCodeUniqueness(sites: any[], code: string, excludeId?: string): boolean {
    const checkInSites = (siteList: any[]): boolean => {
      for (const site of siteList) {
        if (site.id !== excludeId && site.integrationCode === code) {
          return true;
        }
        if (site.children && site.children.length > 0) {
          if (checkInSites(site.children)) {
            return true;
          }
        }
      }
      return false;
    };
    
    return checkInSites(sites);
  }

  private static checkPolygonNameUniqueness(sites: any[], name: string, excludeId?: string): boolean {
    const checkInSites = (siteList: any[]): boolean => {
      for (const site of siteList) {
        if (site.polygon && site.polygon.id !== excludeId && site.polygon.name === name) {
          return true;
        }
        if (site.children && site.children.length > 0) {
          if (checkInSites(site.children)) {
            return true;
          }
        }
      }
      return false;
    };
    
    return checkInSites(sites);
  }
}