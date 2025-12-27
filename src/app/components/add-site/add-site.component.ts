import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AsyncValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SiteService } from '../../services/site.service';
import { LanguageService } from '../../services/language.service';
import { Site, CreateSiteRequest } from '../../models/site.model';
import { CustomValidators } from '../../validators/custom-validators';

@Component({
  selector: 'app-add-site',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="add-site-container">
      <div class="form-header">
        <h2>{{ isEditMode() ? ('ADMIN.EDIT_SITE' | translate) : ('ADMIN.ADD_SITE' | translate) }}</h2>
        <button class="close-btn" (click)="goBack()">×</button>
      </div>

      <form [formGroup]="siteForm" (ngSubmit)="onSubmit()" class="site-form">
        <div class="form-group">
          <label for="path">{{ 'SITE.PATH' | translate }}:</label>
          <input 
            type="text" 
            id="path" 
            [value]="generatedPath()" 
            readonly 
            class="form-control readonly">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="nameEn">{{ 'SITE.NAME_EN' | translate }}: <span class="required">*</span></label>
            <input 
              type="text" 
              id="nameEn" 
              formControlName="nameEn" 
              class="form-control"
              [class.error]="isFieldInvalid('nameEn')">
            @if (isFieldInvalid('nameEn')) {
              <div class="error-message">
                @if (siteForm.get('nameEn')?.errors?.['required']) {
                  <div>• {{ 'VALIDATION.REQUIRED' | translate }}</div>
                }
                @if (siteForm.get('nameEn')?.errors?.['minlength'] || siteForm.get('nameEn')?.errors?.['maxlength']) {
                  <div>• {{ 'VALIDATION.SITE_NAME_LENGTH' | translate }}</div>
                }
                @if (siteForm.get('nameEn')?.errors?.['englishText']) {
                  <div>• {{ 'VALIDATION.ENGLISH_TEXT' | translate }}</div>
                }
                @if (siteForm.get('nameEn')?.errors?.['englishTextSpecialOnly']) {
                  <div>• {{ 'VALIDATION.ENGLISH_TEXT' | translate }}</div>
                }
                @if (siteForm.get('nameEn')?.errors?.['uniqueName']) {
                  <div>• {{ 'VALIDATION.UNIQUE_NAME' | translate }}</div>
                }
              </div>
            }
          </div>

          <div class="form-group">
            <label for="nameAr">{{ 'SITE.NAME_AR' | translate }}: <span class="required">*</span></label>
            <input 
              type="text" 
              id="nameAr" 
              formControlName="nameAr" 
              class="form-control"
              [class.error]="isFieldInvalid('nameAr')">
            @if (isFieldInvalid('nameAr')) {
              <div class="error-message">
                @if (siteForm.get('nameAr')?.errors?.['required']) {
                  <div>• {{ 'VALIDATION.REQUIRED' | translate }}</div>
                }
                @if (siteForm.get('nameAr')?.errors?.['minlength'] || siteForm.get('nameAr')?.errors?.['maxlength']) {
                  <div>• {{ 'VALIDATION.SITE_NAME_LENGTH' | translate }}</div>
                }
                @if (siteForm.get('nameAr')?.errors?.['arabicText']) {
                  <div>• {{ 'VALIDATION.ARABIC_TEXT' | translate }}</div>
                }
                @if (siteForm.get('nameAr')?.errors?.['arabicTextSpecialOnly']) {
                  <div>• {{ 'VALIDATION.ARABIC_TEXT' | translate }}</div>
                }
                @if (siteForm.get('nameAr')?.errors?.['uniqueName']) {
                  <div>• {{ 'VALIDATION.UNIQUE_NAME' | translate }}</div>
                }
              </div>
            }
          </div>
        </div>

        @if (hasParentSite()) {
          <div class="form-group">
            <label class="toggle-label">
              @if (languageService.getIsRTL()) {
                <!-- Arabic: text first, then checkbox (موقع فرعي ☐) -->
                <span class="toggle-text">{{ 'SITE.LEAF_TOGGLE' | translate }}</span>
                <input
                  type="checkbox"
                  formControlName="isLeaf"
                  (change)="onLeafToggleChange()">
              } @else {
                <!-- English: text first, then checkbox (Leaf ☐) -->
                <span class="toggle-text">{{ 'SITE.LEAF_TOGGLE' | translate }}</span>
                <input
                  type="checkbox"
                  formControlName="isLeaf"
                  (change)="onLeafToggleChange()">
              }
            </label>
          </div>
        } @else {
          <div class="info-message">
            <div class="info-content">
              <span class="info-text">{{ 'MESSAGES.PARENT_SITE_INFO' | translate }}</span>
            </div>
          </div>
        }

        @if (isLeaf()) {
          <div class="leaf-fields">
            <div class="form-row">
              <div class="form-group">
                <label for="pricePerHour">{{ 'SITE.PRICE_PER_HOUR' | translate }}: <span class="required">*</span></label>
                <div class="price-input-container">
                  <input 
                    type="text" 
                    id="pricePerHour" 
                    formControlName="pricePerHour" 
                    (input)="onPriceInput($event)"
                    (blur)="onPriceBlur($event)"
                    class="form-control price-input"
                    [class.error]="isFieldInvalid('pricePerHour')"
                    placeholder="0">
                  <span class="currency-suffix">SAR</span>
                </div>
                @if (isFieldInvalid('pricePerHour')) {
                  <div class="error-message">
                    @if (siteForm.get('pricePerHour')?.errors?.['required']) {
                      <div>• {{ 'VALIDATION.REQUIRED' | translate }}</div>
                    }
                    @if (siteForm.get('pricePerHour')?.errors?.['min']) {
                      <div>• {{ 'VALIDATION.PRICE_MIN' | translate }}</div>
                    }
                    @if (siteForm.get('pricePerHour')?.errors?.['max']) {
                      <div>• {{ 'VALIDATION.PRICE_MAX' | translate }}</div>
                    }
                    @if (siteForm.get('pricePerHour')?.errors?.['priceFormat']) {
                      <div>• {{ 'VALIDATION.PRICE_FORMAT' | translate }}</div>
                    }
                  </div>
                }
              </div>

              <div class="form-group">
                <label for="numberOfSlots">{{ 'SITE.NUMBER_OF_SLOTS' | translate }}: <span class="required">*</span></label>
                <input
                  type="number"
                  id="numberOfSlots"
                  formControlName="numberOfSlots"
                  min="1"
                  max="10000"
                  step="1"
                  class="form-control"
                  [class.error]="isFieldInvalid('numberOfSlots')">
                @if (isFieldInvalid('numberOfSlots')) {
                  <div class="error-message">
                    @if (siteForm.get('numberOfSlots')?.errors?.['required']) {
                      <div>• {{ 'VALIDATION.REQUIRED' | translate }}</div>
                    }
                    @if (siteForm.get('numberOfSlots')?.errors?.['min'] || siteForm.get('numberOfSlots')?.errors?.['max']) {
                      <div>• {{ 'VALIDATION.SLOTS_RANGE' | translate }}</div>
                    }
                    @if (siteForm.get('numberOfSlots')?.errors?.['integer']) {
                      <div>• {{ 'VALIDATION.INTEGER_ONLY' | translate }}</div>
                    }
                  </div>
                }
              </div>
            </div>

            <div class="form-group">
              <label for="integrationCode">{{ 'SITE.INTEGRATION_CODE' | translate }}: <span class="required">*</span></label>
              <input 
                type="text" 
                id="integrationCode" 
                formControlName="integrationCode" 
                class="form-control"
                [class.error]="isFieldInvalid('integrationCode')"
                maxlength="100"
                (input)="onIntegrationCodeInput($event)">
              @if (isFieldInvalid('integrationCode')) {
                <div class="error-message">
                  @if (siteForm.get('integrationCode')?.errors?.['required']) {
                    <div>• {{ 'VALIDATION.REQUIRED' | translate }}</div>
                  }
                  @if (siteForm.get('integrationCode')?.errors?.['minlength']) {
                    <div>• {{ 'VALIDATION.MIN_LENGTH' | translate }}</div>
                  }
                  @if (siteForm.get('integrationCode')?.errors?.['maxlength']) {
                    <div>• {{ 'VALIDATION.MAX_LENGTH' | translate }}</div>
                  }
                  @if (siteForm.get('integrationCode')?.errors?.['integrationCodeFormat']) {
                    <div>• {{ 'VALIDATION.INTEGRATION_CODE_FORMAT' | translate }}</div>
                  }
                  @if (siteForm.get('integrationCode')?.errors?.['uniqueIntegrationCode']) {
                    <div>• {{ 'VALIDATION.INTEGRATION_CODE_EXISTS' | translate }}</div>
                  }
                </div>
              }
            </div>



            <div class="polygon-status">
              <span class="status-label">{{ 'SITE.POLYGONS' | translate }}:</span>
              @if (polygonAdded()) {
                <div class="polygon-list">
                  @for (polygonName of polygonNames(); track $index) {
                    <span class="polygon-name">{{ polygonName }}</span>
                  }
                </div>
              } @else {
                <span class="status-value not-added">{{ 'SITE.NONE_ADDED' | translate }}</span>
              }
              <button type="button" class="add-polygon-btn" (click)="addPolygon()">
                + {{ 'POLYGON.ADD_POLYGON' | translate }}
              </button>
            </div>
          </div>
        }

        <div class="form-actions">
          <button
            type="button"
            id="cancel-site-btn"
            class="btn btn-secondary"
            (click)="goBack()">
            {{ 'COMMON.CANCEL' | translate }}
          </button>
          <button
            type="submit"
            id="save-site-btn"
            class="btn btn-primary"
            [disabled]="!isFormReady()">
            {{ isEditMode() ? ('COMMON.EDIT' | translate) : ('COMMON.SAVE' | translate) }}
          </button>

          @if (isLeaf() && !polygonAdded() && siteForm.valid) {
            <div class="save-requirement-message">
              <small class="text-warning">
                {{ 'MESSAGES.POLYGON_REQUIRED' | translate }}
              </small>
            </div>
          }
        </div>

        @if (showError()) {
          <div class="alert alert-error">
            <span class="error-icon">⚠</span>
            <span class="error-text">{{ errorMessage() }}</span>
            <button class="close-error" (click)="dismissError()">×</button>
          </div>
        }

        @if (showSuccess()) {
          <div class="alert alert-success">
            <span class="success-icon">✓</span>
            <span class="success-text">{{ successMessage() | translate }}</span>
            <button class="close-success" (click)="dismissSuccess()">×</button>
          </div>
        }
      </form>
    </div>
  `,
  styleUrl: './add-site.component.scss'
})
export class AddSiteComponent implements OnInit, OnDestroy {
  siteForm: FormGroup;
  parentSite = signal<Site | null>(null);
  parentSiteId: string | null = null; // Track parent ID from URL to avoid race condition
  parentPath = signal<string>(''); // Track parent path for immediate use before async load
  isLeaf = signal<boolean>(false);
  generatedPath = signal<string>('');
  polygonAdded = signal<boolean>(false);
  polygonCount = signal<number>(0);
  polygonNames = signal<string[]>([]);
  isEditMode = signal<boolean>(false);
  editingSite = signal<Site | null>(null);
  errorMessage = signal<string>('');
  showError = signal<boolean>(false);
  successMessage = signal<string>('');
  showSuccess = signal<boolean>(false);
  private navigatingToPolygon = false;

  constructor(
    private fb: FormBuilder,
    private siteService: SiteService,
    private router: Router,
    private route: ActivatedRoute,
    public languageService: LanguageService
  ) {
    this.siteForm = this.createForm();
  }

  ngOnInit(): void {
    const parentId = this.route.snapshot.queryParams['parentId'];
    const siteId = this.route.snapshot.queryParams['siteId'];
    const mode = this.route.snapshot.queryParams['mode'];
    const polygonAdded = this.route.snapshot.queryParams['polygonAdded'];
    const returnFrom = this.route.snapshot.queryParams['returnFrom'];

    // Store parentId from URL to avoid race condition with async parent loading
    if (parentId) {
      this.parentSiteId = parentId;
    }

    console.log('ngOnInit - parentId:', parentId, 'siteId:', siteId, 'mode:', mode, 'polygonAdded:', polygonAdded, 'returnFrom:', returnFrom);

    // Clear saved data if starting fresh (no specific context parameters)
    // Don't clear if returning from polygon form OR if there's existing form data to restore
    const hasSavedFormData = localStorage.getItem('addSiteFormData');
    if (!parentId && !siteId && !mode && !polygonAdded && !returnFrom && !hasSavedFormData) {
      console.log('Starting fresh - clearing any existing form data');
      this.clearSavedData();
    } else {
      console.log('Not starting fresh - preserving existing form data');
    }

    // Check if this is edit mode
    if (mode === 'edit' && siteId) {
      this.isEditMode.set(true);
      this.loadExistingSite(siteId);
      
      // If returning from polygon form in edit mode, reload the site to get updated polygon data
      if (polygonAdded === 'true') {
        console.log('Returning from polygon form in edit mode - reloading site data');
        // Small delay to ensure the polygon was saved before reloading
        setTimeout(() => {
          this.loadExistingSite(siteId);
        }, 100);
      }
    } else {
      // Check if returning from polygon form (for new sites only)
      if (polygonAdded === 'true') {
        this.updatePolygonStatus();
        localStorage.setItem('polygonAdded', 'true');
        console.log('Returning from polygon form - polygon added');
      }
    }

    // Handle parent site loading first (for new sites)
    if (parentId && !localStorage.getItem('addSiteFormData') && !this.isEditMode()) {
      console.log('Loading parent site for new site creation');
      // parentSiteId is already set above, now load the full parent object
      this.siteService.getSiteById(parentId).subscribe(parent => {
        if (parent) {
          this.parentSite.set(parent);
          this.parentPath.set(parent.path); // Set parent path for correct path generation
          this.updateGeneratedPath();
          // Enable leaf toggle for new sites with parent
          this.siteForm.get('isLeaf')?.enable();
        }
      });
    } else if (!parentId && !localStorage.getItem('addSiteFormData') && !this.isEditMode()) {
      // If no parent site and no saved data, ensure isLeaf is false and disabled
      this.parentSiteId = null;
      this.parentPath.set('');
      this.siteForm.get('isLeaf')?.setValue(false);
      this.siteForm.get('isLeaf')?.disable();
      this.isLeaf.set(false);
    }

    // Restore any existing form data (this handles browser reload and returning from polygon form)
    if (!this.isEditMode()) {
      this.restoreFormData();
    }

    // Watch for form changes to auto-save (only for new sites)
    if (!this.isEditMode()) {
      this.siteForm.valueChanges.subscribe(formValue => {
        this.saveFormData();
      });
    }

    // Watch for name changes to update path
    this.siteForm.get('nameEn')?.valueChanges.subscribe(() => {
      this.updateGeneratedPath();
    });
  }

  ngOnDestroy(): void {
    // Clear form data when component is destroyed (navigating away)
    // Only clear if we're not in edit mode and haven't successfully saved
    // AND we're not navigating to the polygon form (which is part of the same workflow)
    if (!this.isEditMode() && !this.showSuccess() && !this.navigatingToPolygon) {
      console.log('Component destroyed - clearing unsaved form data');
      this.clearSavedData();
    } else if (this.navigatingToPolygon) {
      console.log('Component destroyed - preserving data for polygon form navigation');
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nameEn: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(100),
        CustomValidators.englishText()
      ]],
      nameAr: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(100),
        CustomValidators.arabicText()
      ]],
      isLeaf: [false],
      pricePerHour: [null],
      integrationCode: [''],
      numberOfSlots: [null, [Validators.min(1), Validators.max(10000), CustomValidators.integer()]]
    });
  }

  hasParentSite(): boolean {
    // Check both the loaded parent site and the parentSiteId from URL
    // This ensures the checkbox appears even if parent is still loading
    return this.parentSite() !== null || this.parentSiteId !== null;
  }

  onLeafToggleChange(): void {
    // Only allow leaf toggle if there's a parent site
    if (!this.hasParentSite()) {
      this.siteForm.get('isLeaf')?.setValue(false);
      this.isLeaf.set(false);
      return;
    }

    const isLeafValue = this.siteForm.get('isLeaf')?.value;
    this.isLeaf.set(isLeafValue);

    console.log('Leaf toggle changed to:', isLeafValue);

    if (isLeafValue) {
      const excludeId = this.isEditMode() ? this.editingSite()?.id : undefined;
      
      // Add required validators for leaf fields
      this.siteForm.get('pricePerHour')?.setValidators([
        Validators.required, 
        Validators.min(0.01),
        Validators.max(999.99),
        CustomValidators.priceFormat()
      ]);
      
      this.siteForm.get('integrationCode')?.setValidators([
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(100),
        CustomValidators.integrationCodeFormat()
      ]);
      
      this.siteForm.get('numberOfSlots')?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(10000),
        CustomValidators.integer()
      ]);
    } else {
      // Remove validators for leaf fields
      this.siteForm.get('pricePerHour')?.clearValidators();
      this.siteForm.get('integrationCode')?.clearValidators();
      this.siteForm.get('numberOfSlots')?.clearValidators();
      
      // Only clear values for leaf fields when switching to parent (not in edit mode)
      if (!this.isEditMode()) {
        this.siteForm.get('pricePerHour')?.setValue(null);
        this.siteForm.get('integrationCode')?.setValue('');
        this.siteForm.get('numberOfSlots')?.setValue(null);
        
        // Reset polygon status when switching to parent
        this.polygonAdded.set(false);
        this.polygonCount.set(0);
        this.polygonNames.set([]);
        localStorage.removeItem('polygonAdded');
        localStorage.removeItem('tempPolygonData');
      }
    }

    // Update form validation
    Object.keys(this.siteForm.controls).forEach(key => {
      this.siteForm.get(key)?.updateValueAndValidity();
    });
  }

  private updateGeneratedPath(): void {
    const nameEn = this.siteForm.get('nameEn')?.value || '';
    const slug = this.slugify(nameEn);
    // Use the stored parentPath signal which is set immediately on restore
    const parentPathValue = this.parentPath();
    this.generatedPath.set(parentPathValue ? `${parentPathValue}/${slug}` : `/${slug}`);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.siteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isFormReady(): boolean {
    // Check if form is valid or pending (async validators still running)
    const formValid = this.siteForm.valid || this.siteForm.status === 'PENDING';
    
    // For leaf sites, also check if polygon is added
    if (this.isLeaf()) {
      return formValid && this.polygonAdded();
    }
    
    return formValid;
  }

  onPriceInput(event: any): void {
    const input = event.target;
    let value = input.value;
    
    // Remove any characters that aren't digits or decimal point
    value = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    // Update both input value and form control
    input.value = value;
    
    // Update form control with the cleaned value
    if (value) {
      this.siteForm.get('pricePerHour')?.setValue(value, { emitEvent: false });
    } else {
      this.siteForm.get('pricePerHour')?.setValue(null, { emitEvent: false });
    }
    
    // Manually trigger validation
    this.siteForm.get('pricePerHour')?.updateValueAndValidity();
  }

  onPriceBlur(event: any): void {
    const input = event.target;
    let value = input.value;
    
    if (value && !isNaN(parseFloat(value))) {
      // Keep the original format if it's valid (don't force 2 decimal places)
      const numValue = parseFloat(value);
      
      // Only format if the value has more than 2 decimal places
      const decimalPlaces = (value.toString().split('.')[1] || '').length;
      let formattedValue = value;
      
      if (decimalPlaces > 2) {
        // Round to 2 decimal places if more than 2 decimals
        formattedValue = numValue.toFixed(2);
      } else {
        // Keep original format (integer, 1 decimal, or 2 decimals)
        formattedValue = numValue.toString();
      }
      
      // Update both input and form control
      input.value = formattedValue;
      this.siteForm.get('pricePerHour')?.setValue(formattedValue);
    } else {
      this.siteForm.get('pricePerHour')?.setValue(null);
    }
  }

  onIntegrationCodeInput(event: any): void {
    const input = event.target;
    let value = input.value;
    
    // Trim to maximum 100 characters
    if (value.length > 100) {
      value = value.substring(0, 100);
      input.value = value;
      this.siteForm.get('integrationCode')?.setValue(value, { emitEvent: false });
    }
  }

  addPolygon(): void {
    // Save current form data (this will be automatically saved by the valueChanges subscription)
    this.saveFormData();
    
    // Set flag to indicate we're navigating to polygon form
    this.navigatingToPolygon = true;
    
    // Navigate to polygon form
    const siteId = this.isEditMode() ? this.editingSite()?.id || 'temp-site-id' : 'temp-site-id';
    const returnTo = this.isEditMode() ? 'edit-site' : 'add-site';
    
    this.router.navigate(['/admin/polygon'], { 
      queryParams: { 
        siteId: siteId,
        returnTo: returnTo
      } 
    });
  }

  onSubmit(): void {
    if (this.siteForm.valid && (!this.isLeaf() || this.polygonAdded())) {
      const formValue = this.siteForm.value;
      
      if (this.isEditMode()) {
        // Update existing site
        const updates: Partial<Site> = {
          nameEn: formValue.nameEn,
          nameAr: formValue.nameAr,
          pricePerHour: formValue.pricePerHour,
          integrationCode: formValue.integrationCode,
          numberOfSlots: formValue.numberOfSlots
        };

        this.siteService.updateSite(this.editingSite()!.id, updates).subscribe({
          next: (updatedSite) => {
            console.log('Site updated successfully');
            // Show success message
            this.displaySuccess('MESSAGES.SITE_UPDATED');

            // Select the updated site and navigate after showing message
            setTimeout(() => {
              this.siteService.selectSite(updatedSite);
              this.clearSavedData();
              this.router.navigate(['/admin']);
            }, 2000);
          },
          error: (error) => {
            console.error('Error updating site:', error);
            this.displayError(error);
          }
        });
      } else {
        // Create new site
        const request: CreateSiteRequest = {
          nameEn: formValue.nameEn,
          nameAr: formValue.nameAr,
          parentId: this.parentSiteId || this.parentSite()?.id, // Use parentSiteId as primary source
          isLeaf: formValue.isLeaf,
          pricePerHour: formValue.pricePerHour,
          integrationCode: formValue.integrationCode,
          numberOfSlots: formValue.numberOfSlots
        };

        // If this is a leaf site with polygons, include them in the request
        if (formValue.isLeaf && this.polygonAdded()) {
          const polygonsData = this.getStoredPolygonData();
          if (polygonsData && polygonsData.length > 0) {
            // Convert polygon data to backend format
            request.polygons = polygonsData.map(polygon => ({
              name: polygon.name,
              points: polygon.coordinates.map(coord => ({
                latitude: coord.latitude,
                longitude: coord.longitude
              }))
            }));
          }
        }

        this.siteService.createSite(request).subscribe({
          next: (newSite) => {
            // Show success message
            this.displaySuccess('MESSAGES.SITE_ADDED_SUCCESS');

            // Clear saved data and navigate after showing message
            setTimeout(() => {
              this.clearSavedData();
              this.router.navigate(['/admin']);
            }, 2000);
          },
          error: (error) => {
            console.error('Error creating site:', error);
            this.displayError(error);
          }
        });
      }
    }
  }

  private saveFormData(): void {
    const formData = {
      ...this.siteForm.value,
      parentId: this.parentSiteId || this.parentSite()?.id, // Use parentSiteId to avoid race condition
      parentPath: this.parentSite()?.path || '', // Save parent path for immediate restoration
      generatedPath: this.generatedPath(),
      polygonAdded: this.polygonAdded(),
      polygonCount: this.polygonCount(),
      isLeaf: this.isLeaf() // Explicitly save the leaf status
    };
    console.log('Saving form data:', formData);
    localStorage.setItem('addSiteFormData', JSON.stringify(formData));
  }

  private restoreFormData(): void {
    const savedData = localStorage.getItem('addSiteFormData');
    const polygonStatus = localStorage.getItem('polygonAdded');

    console.log('Restoring form data:', savedData);
    console.log('Polygon status:', polygonStatus);

    if (savedData) {
      try {
        const formData = JSON.parse(savedData);

        // Restore form values but NOT isLeaf (reset checkbox on reload)
        this.siteForm.patchValue({
          nameEn: formData.nameEn,
          nameAr: formData.nameAr,
          pricePerHour: formData.pricePerHour,
          integrationCode: formData.integrationCode,
          numberOfSlots: formData.numberOfSlots
        });

        // Restore polygon count if available
        if (formData.polygonCount !== undefined) {
          this.polygonCount.set(formData.polygonCount);
        }

        if (formData.parentId) {
          // Store the parentSiteId immediately to ensure hasParentSite() returns true
          this.parentSiteId = formData.parentId;

          // Restore parent path IMMEDIATELY for correct path generation
          if (formData.parentPath) {
            this.parentPath.set(formData.parentPath);
          }

          // Update path immediately with the restored parent path
          this.updateGeneratedPath();

          this.siteService.getSiteById(formData.parentId).subscribe(parent => {
            if (parent) {
              this.parentSite.set(parent);
              // Update parent path with loaded data (in case it changed)
              this.parentPath.set(parent.path);

              // CONDITIONAL RESTORATION: Only restore leaf status if polygon was added
              // This implements the requirement: polygon is the commitment point
              // - If polygon exists → preserve leaf checkbox and all data
              // - If no polygon → reset to unchecked (treat reload as "start over")
              this.siteForm.get('isLeaf')?.enable();

              const polygonsData = this.getStoredPolygonData();
              const hasPolygon = polygonsData.length > 0;

              if (hasPolygon) {
                // Polygon exists → restore leaf status from saved data
                const savedIsLeaf = formData.isLeaf ?? false;
                this.siteForm.get('isLeaf')?.setValue(savedIsLeaf);
                this.isLeaf.set(savedIsLeaf);
              } else {
                // No polygon → reset to unchecked (reload without polygon = start over)
                this.siteForm.get('isLeaf')?.setValue(false);
                this.isLeaf.set(false);
              }

              // Update the path again with the loaded parent site
              this.updateGeneratedPath();

              // Re-apply validators based on leaf status
              setTimeout(() => {
                this.onLeafToggleChange();
              }, 0);
            }
          });
        } else {
          // No parent site, force to parent site
          this.parentSiteId = null;
          this.parentPath.set('');
          this.isLeaf.set(false);
          this.siteForm.get('isLeaf')?.setValue(false);
          this.siteForm.get('isLeaf')?.disable();
          this.updateGeneratedPath();
        }
      } catch (error) {
        console.error('Error restoring form data:', error);
        this.clearSavedData();
      }
    }

    // Restore polygon status
    if (polygonStatus === 'true') {
      this.updatePolygonStatus();
    }
  }

  private updatePolygonStatus(): void {
    const polygonsData = this.getStoredPolygonData();
    const hasPolygons = polygonsData.length > 0;
    const names = polygonsData.map(p => p.name);
    
    this.polygonAdded.set(hasPolygons);
    this.polygonCount.set(polygonsData.length);
    this.polygonNames.set(names);
    
    console.log('Updated polygon status:', hasPolygons, 'count:', polygonsData.length, 'names:', names);
  }

  private getStoredPolygonData(): { name: string; coordinates: any[] }[] {
    try {
      const polygonData = localStorage.getItem('tempPolygonData');
      if (polygonData) {
        const parsed = JSON.parse(polygonData);
        // Handle both old single polygon format and new array format
        if (Array.isArray(parsed)) {
          return parsed;
        } else {
          // Convert old single polygon format to array
          return [parsed];
        }
      }
      return [];
    } catch (error) {
      console.error('Error retrieving polygon data:', error);
      return [];
    }
  }

  private loadExistingSite(siteId: string): void {
    this.siteService.getSiteById(siteId).subscribe(site => {
      if (site) {
        this.editingSite.set(site);
        
        // Pre-fill the form with existing site data
        this.siteForm.patchValue({
          nameEn: site.nameEn,
          nameAr: site.nameAr,
          isLeaf: site.type === 'leaf',
          pricePerHour: site.pricePerHour || null,
          integrationCode: site.integrationCode || '',
          numberOfSlots: site.numberOfSlots || null
        });

        // Set the leaf status
        this.isLeaf.set(site.type === 'leaf');
        
        // Set the generated path
        this.generatedPath.set(site.path);
        
        // Load parent site if exists
        if (site.parentId) {
          this.siteService.getSiteById(site.parentId).subscribe(parent => {
            if (parent) {
              this.parentSite.set(parent);
              this.parentPath.set(parent.path); // Set parent path for correct path generation

              // Enable the isLeaf control since we have a parent
              this.siteForm.get('isLeaf')?.enable();

              // Properly configure the form based on leaf status
              setTimeout(() => {
                this.onLeafToggleChange();
              }, 0);
            }
          });
        } else {
          // No parent site, disable leaf toggle
          this.parentPath.set('');
          this.siteForm.get('isLeaf')?.disable();

          // Still configure the form properly for the current state
          setTimeout(() => {
            this.onLeafToggleChange();
          }, 0);
        }
        
        // Check if site has polygons
        if (site.polygons && site.polygons.length > 0) {
          this.polygonAdded.set(true);
          this.polygonCount.set(site.polygons.length);
          this.polygonNames.set(site.polygons.map(p => p.name));
        }
      }
    });
  }

  private clearSavedData(): void {
    localStorage.removeItem('addSiteFormData');
    localStorage.removeItem('polygonAdded');
    localStorage.removeItem('tempPolygonData');
    sessionStorage.removeItem('tempSiteData');
  }

  goBack(): void {
    this.clearSavedData();
    this.router.navigate(['/admin']);
  }

  /**
   * Display error message from backend response
   */
  private displayError(error: any): void {
    let message = 'An error occurred. Please try again.';

    if (error?.error) {
      // Check for different error response formats
      if (typeof error.error === 'string') {
        message = error.error;
      } else if (error.error.error) {
        message = error.error.error;
      } else if (error.error.message) {
        message = error.error.message;
      } else if (error.error.details) {
        message = error.error.details;
      }
    } else if (error?.message) {
      message = error.message;
    }

    // Translate backend error message if available
    const translatedMessage = this.languageService.translateBackendError(message);
    this.errorMessage.set(translatedMessage);
    this.showError.set(true);

    // Auto-hide error after 5 seconds
    setTimeout(() => {
      this.dismissError();
    }, 5000);
  }

  /**
   * Dismiss error message
   */
  dismissError(): void {
    this.showError.set(false);
    this.errorMessage.set('');
  }

  /**
   * Display success message
   */
  private displaySuccess(messageKey: string): void {
    this.successMessage.set(messageKey);
    this.showSuccess.set(true);

    // Auto-hide success message after 2 seconds
    setTimeout(() => {
      this.dismissSuccess();
    }, 2000);
  }

  /**
   * Dismiss success message
   */
  dismissSuccess(): void {
    this.showSuccess.set(false);
    this.successMessage.set('');
  }
}