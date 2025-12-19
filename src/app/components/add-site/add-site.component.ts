import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AsyncValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SiteService } from '../../services/site.service';
import { Site, CreateSiteRequest } from '../../models/site.model';
import { CustomValidators } from '../../validators/custom-validators';

@Component({
  selector: 'app-add-site',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="add-site-container">
      <div class="form-header">
        <h2>{{ isEditMode() ? 'Edit Site' : 'Add Site' }}</h2>
        <button class="close-btn" (click)="goBack()">×</button>
      </div>

      <form [formGroup]="siteForm" (ngSubmit)="onSubmit()" class="site-form">
        <div class="form-group">
          <label for="path">Path:</label>
          <input 
            type="text" 
            id="path" 
            [value]="generatedPath()" 
            readonly 
            class="form-control readonly">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="nameEn">Name (EN): <span class="required">*</span></label>
            <input 
              type="text" 
              id="nameEn" 
              formControlName="nameEn" 
              class="form-control"
              [class.error]="isFieldInvalid('nameEn')">
            @if (isFieldInvalid('nameEn')) {
              <div class="error-message">
                @if (siteForm.get('nameEn')?.errors?.['required']) {
                  <div>This field is required</div>
                }
                @if (siteForm.get('nameEn')?.errors?.['minlength'] || siteForm.get('nameEn')?.errors?.['maxlength']) {
                  <div>The site name must contain number of characters in the range 3 to 100 characters</div>
                }
                @if (siteForm.get('nameEn')?.errors?.['englishText']) {
                  <div>Only English letters, numbers, and basic punctuation are allowed</div>
                }
                @if (siteForm.get('nameEn')?.errors?.['uniqueName']) {
                  <div>This name is already in use</div>
                }
              </div>
            }
          </div>

          <div class="form-group">
            <label for="nameAr">Name (AR): <span class="required">*</span></label>
            <input 
              type="text" 
              id="nameAr" 
              formControlName="nameAr" 
              class="form-control"
              [class.error]="isFieldInvalid('nameAr')">
            @if (isFieldInvalid('nameAr')) {
              <div class="error-message">
                @if (siteForm.get('nameAr')?.errors?.['required']) {
                  <div>This field is required</div>
                }
                @if (siteForm.get('nameAr')?.errors?.['minlength'] || siteForm.get('nameAr')?.errors?.['maxlength']) {
                  <div>The site name must contain number of characters in the range 3 to 100 characters</div>
                }
                @if (siteForm.get('nameAr')?.errors?.['arabicText']) {
                  <div>Only Arabic letters, numbers, and basic punctuation are allowed</div>
                }
                @if (siteForm.get('nameAr')?.errors?.['uniqueName']) {
                  <div>This name is already in use</div>
                }
              </div>
            }
          </div>
        </div>

        @if (hasParentSite()) {
          <div class="form-group">
            <label class="toggle-label">
              <input
                type="checkbox"
                formControlName="isLeaf"
                (change)="onLeafToggleChange()">
              <span class="toggle-text">Leaf Toggle</span>
            </label>
          </div>
        } @else {
          <div class="info-message">
            <div class="info-content">
              <span class="info-text">This will be created as a Parent Site. To create a Leaf Site, use the "+" button next to a parent site in the tree.</span>
            </div>
          </div>
        }

        @if (isLeaf()) {
          <div class="leaf-fields">
            <div class="form-row">
              <div class="form-group">
                <label for="pricePerHour">Price per Hour: <span class="required">*</span></label>
                <input 
                  type="text" 
                  id="pricePerHour" 
                  formControlName="pricePerHour" 
                  (input)="onPriceInput($event)"
                  (blur)="onPriceBlur($event)"
                  class="form-control"
                  [class.error]="isFieldInvalid('pricePerHour')"
                  placeholder="0.00">
                @if (isFieldInvalid('pricePerHour')) {
                  <div class="error-message">
                    @if (siteForm.get('pricePerHour')?.errors?.['required']) {
                      <div>This field is required</div>
                    }
                    @if (siteForm.get('pricePerHour')?.errors?.['min']) {
                      <div>Price must be greater than 0</div>
                    }
                    @if (siteForm.get('pricePerHour')?.errors?.['max']) {
                      <div>Price cannot exceed 999.99</div>
                    }
                    @if (siteForm.get('pricePerHour')?.errors?.['priceFormat']) {
                      <div>Price must have exactly 2 decimal places (e.g., 5.00, 10.50)</div>
                    }
                  </div>
                }
              </div>

              <div class="form-group">
                <label for="numberOfSlots">Number of Slots: <span class="required">*</span></label>
                <input 
                  type="number" 
                  id="numberOfSlots" 
                  formControlName="numberOfSlots" 
                  min="1" 
                  max="10000"
                  class="form-control"
                  [class.error]="isFieldInvalid('numberOfSlots')">
                @if (isFieldInvalid('numberOfSlots')) {
                  <div class="error-message">
                    @if (siteForm.get('numberOfSlots')?.errors?.['required']) {
                      <div>This field is required</div>
                    }
                    @if (siteForm.get('numberOfSlots')?.errors?.['min']) {
                      <div>Minimum value is 1</div>
                    }
                    @if (siteForm.get('numberOfSlots')?.errors?.['max']) {
                      <div>Maximum value is 10000</div>
                    }
                  </div>
                }
              </div>
            </div>

            <div class="form-group">
              <label for="integrationCode">Integration Code: <span class="required">*</span></label>
              <input 
                type="text" 
                id="integrationCode" 
                formControlName="integrationCode" 
                class="form-control"
                [class.error]="isFieldInvalid('integrationCode')">
              @if (isFieldInvalid('integrationCode')) {
                <div class="error-message">
                  @if (siteForm.get('integrationCode')?.errors?.['required']) {
                    <div>This field is required</div>
                  }
                  @if (siteForm.get('integrationCode')?.errors?.['minlength']) {
                    <div>Minimum length is 3 characters</div>
                  }
                  @if (siteForm.get('integrationCode')?.errors?.['maxlength']) {
                    <div>Maximum length is 100 characters</div>
                  }
                  @if (siteForm.get('integrationCode')?.errors?.['integrationCodeFormat']) {
                    <div>Only letters, numbers, hyphens, spaces, and underscores are allowed</div>
                  }
                  @if (siteForm.get('integrationCode')?.errors?.['uniqueIntegrationCode']) {
                    <div>This integration code is already in use</div>
                  }
                </div>
              }
            </div>



            <div class="polygon-status">
              <span class="status-label">Polygon Status:</span>
              <span class="status-value" [class.not-added]="!polygonAdded()" [class.added]="polygonAdded()">
                {{ polygonAdded() ? '✓ Added' : '■ Not Added' }}
              </span>
              @if (!polygonAdded()) {
                <button type="button" class="add-polygon-btn" (click)="addPolygon()">
                  + Add Polygon
                </button>
              }
            </div>
          </div>
        }

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="goBack()">
            Cancel
          </button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            [disabled]="!isFormReady()">
            {{ isEditMode() ? 'Update' : 'Save' }}
          </button>
          
          @if (isLeaf() && !polygonAdded() && siteForm.valid) {
            <div class="save-requirement-message">
              <small class="text-warning">
                Polygon must be added before saving a leaf site
              </small>
            </div>
          }
        </div>
      </form>
    </div>
  `,
  styleUrl: './add-site.component.scss'
})
export class AddSiteComponent implements OnInit {
  siteForm: FormGroup;
  parentSite = signal<Site | null>(null);
  isLeaf = signal<boolean>(false);
  generatedPath = signal<string>('');
  polygonAdded = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  editingSite = signal<Site | null>(null);

  constructor(
    private fb: FormBuilder,
    private siteService: SiteService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.siteForm = this.createForm();
  }

  ngOnInit(): void {
    const parentId = this.route.snapshot.queryParams['parentId'];
    const siteId = this.route.snapshot.queryParams['siteId'];
    const mode = this.route.snapshot.queryParams['mode'];
    const polygonAdded = this.route.snapshot.queryParams['polygonAdded'];

    console.log('ngOnInit - parentId:', parentId, 'siteId:', siteId, 'mode:', mode, 'polygonAdded:', polygonAdded);

    // Check if this is edit mode
    if (mode === 'edit' && siteId) {
      this.isEditMode.set(true);
      this.loadExistingSite(siteId);
    }

    // Check if returning from polygon form
    if (polygonAdded === 'true') {
      this.polygonAdded.set(true);
      localStorage.setItem('polygonAdded', 'true');
      console.log('Returning from polygon form - polygon added');
    }

    // Handle parent site loading first (for new sites)
    if (parentId && !localStorage.getItem('addSiteFormData') && !this.isEditMode()) {
      console.log('Loading parent site for new site creation');
      this.siteService.getSiteById(parentId).subscribe(parent => {
        if (parent) {
          this.parentSite.set(parent);
          this.updateGeneratedPath();
          // Enable leaf toggle for new sites with parent
          this.siteForm.get('isLeaf')?.enable();
        }
      });
    } else if (!parentId && !localStorage.getItem('addSiteFormData') && !this.isEditMode()) {
      // If no parent site and no saved data, ensure isLeaf is false and disabled
      this.siteForm.get('isLeaf')?.setValue(false);
      this.siteForm.get('isLeaf')?.disable();
      this.isLeaf.set(false);
    }

    // Restore any existing form data (this handles returning from polygon form)
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
      numberOfSlots: [null, [Validators.min(1), Validators.max(10000)]]
    });
  }

  hasParentSite(): boolean {
    return this.parentSite() !== null;
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
        Validators.max(10000)
      ]);
    } else {
      // Remove validators for leaf fields
      this.siteForm.get('pricePerHour')?.clearValidators();
      this.siteForm.get('integrationCode')?.clearValidators();
      this.siteForm.get('numberOfSlots')?.clearValidators();
      
      // Clear values for leaf fields when switching to parent
      this.siteForm.get('pricePerHour')?.setValue(null);
      this.siteForm.get('integrationCode')?.setValue('');
      this.siteForm.get('numberOfSlots')?.setValue(null);
      
      // Reset polygon status when switching to parent
      this.polygonAdded.set(false);
      localStorage.removeItem('polygonAdded');
      localStorage.removeItem('tempPolygonData');
    }

    // Update form validation
    Object.keys(this.siteForm.controls).forEach(key => {
      this.siteForm.get(key)?.updateValueAndValidity();
    });
  }

  private updateGeneratedPath(): void {
    const nameEn = this.siteForm.get('nameEn')?.value || '';
    const slug = this.slugify(nameEn);
    const parentPath = this.parentSite()?.path || '';
    this.generatedPath.set(parentPath ? `${parentPath}/${slug}` : `/${slug}`);
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
      // Format to exactly 2 decimal places
      const numValue = parseFloat(value);
      const formattedValue = numValue.toFixed(2);
      
      // Update both input and form control
      input.value = formattedValue;
      this.siteForm.get('pricePerHour')?.setValue(formattedValue);
    } else {
      this.siteForm.get('pricePerHour')?.setValue(null);
    }
  }

  addPolygon(): void {
    // Save current form data (this will be automatically saved by the valueChanges subscription)
    this.saveFormData();
    
    // Navigate to polygon form
    this.router.navigate(['/admin/polygon'], { 
      queryParams: { 
        siteId: 'temp-site-id',
        returnTo: 'add-site'
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
            // Select the updated site in the dashboard
            this.siteService.selectSite(updatedSite);
            this.clearSavedData();
            this.router.navigate(['/admin']);
          },
          error: (error) => {
            console.error('Error updating site:', error);
          }
        });
      } else {
        // Create new site
        const request: CreateSiteRequest = {
          nameEn: formValue.nameEn,
          nameAr: formValue.nameAr,
          parentId: this.parentSite()?.id,
          isLeaf: formValue.isLeaf,
          pricePerHour: formValue.pricePerHour,
          integrationCode: formValue.integrationCode,
          numberOfSlots: formValue.numberOfSlots
        };

        this.siteService.createSite(request).subscribe({
          next: (newSite) => {
            // If this is a leaf site with a polygon, add the polygon to the site
            if (this.isLeaf() && this.polygonAdded()) {
              const polygonData = this.getStoredPolygonData();
              if (polygonData) {
                this.siteService.createPolygon({
                  name: polygonData.name,
                  coordinates: polygonData.coordinates,
                  siteId: newSite.id
                }).subscribe({
                  next: () => {
                    console.log('Polygon attached to site successfully');
                  },
                  error: (error) => {
                    console.error('Error attaching polygon to site:', error);
                  }
                });
              }
            }
            
            // Clear saved data after successful submission
            this.clearSavedData();
            this.router.navigate(['/admin']);
          },
          error: (error) => {
            console.error('Error creating site:', error);
          }
        });
      }
    }
  }

  private saveFormData(): void {
    const formData = {
      ...this.siteForm.value,
      parentId: this.parentSite()?.id,
      generatedPath: this.generatedPath(),
      polygonAdded: this.polygonAdded(),
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
        
        // Restore form values
        this.siteForm.patchValue(formData);
        this.generatedPath.set(formData.generatedPath || '');
        
        if (formData.parentId) {
          this.siteService.getSiteById(formData.parentId).subscribe(parent => {
            if (parent) {
              this.parentSite.set(parent);
              
              // Restore leaf status and enable the control
              this.siteForm.get('isLeaf')?.enable();
              this.siteForm.get('isLeaf')?.setValue(formData.isLeaf || false);
              this.isLeaf.set(formData.isLeaf || false);
              
              // Re-apply validators based on leaf status
              setTimeout(() => {
                this.onLeafToggleChange();
              }, 0);
            }
          });
        } else {
          // No parent site, force to parent site
          this.isLeaf.set(false);
          this.siteForm.get('isLeaf')?.setValue(false);
          this.siteForm.get('isLeaf')?.disable();
        }
      } catch (error) {
        console.error('Error restoring form data:', error);
        this.clearSavedData();
      }
    }
    
    // Restore polygon status
    if (polygonStatus === 'true') {
      this.polygonAdded.set(true);
    }
  }

  private getStoredPolygonData(): any {
    try {
      const polygonData = localStorage.getItem('tempPolygonData');
      return polygonData ? JSON.parse(polygonData) : null;
    } catch (error) {
      console.error('Error retrieving polygon data:', error);
      return null;
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
            }
          });
        }
        
        // Check if site has polygon
        if (site.polygon) {
          this.polygonAdded.set(true);
        }
        
        // Apply validators based on leaf status
        if (site.type === 'leaf') {
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
            Validators.max(10000)
          ]);
        }
        
        // Update form validation
        Object.keys(this.siteForm.controls).forEach(key => {
          this.siteForm.get(key)?.updateValueAndValidity();
        });
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
}