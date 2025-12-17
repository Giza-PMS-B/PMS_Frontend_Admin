import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SiteService } from '../../services/site.service';
import { Site, CreateSiteRequest } from '../../models/site.model';

@Component({
  selector: 'app-add-site',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="add-site-container">
      <div class="form-header">
        <h2>{{ isLeaf() ? 'Add Leaf Site' : 'Add Parent Site' }}</h2>
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
                  Name (EN) is required
                }
                @if (siteForm.get('nameEn')?.errors?.['minlength']) {
                  Minimum length is 3 characters
                }
                @if (siteForm.get('nameEn')?.errors?.['maxlength']) {
                  Maximum length is 100 characters
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
                  Name (AR) is required
                }
                @if (siteForm.get('nameAr')?.errors?.['minlength']) {
                  Minimum length is 3 characters
                }
                @if (siteForm.get('nameAr')?.errors?.['maxlength']) {
                  Maximum length is 100 characters
                }
              </div>
            }
          </div>
        </div>

        <div class="form-group">
          <label class="toggle-label">
            <input
              type="checkbox"
              formControlName="isLeaf"
              (change)="onLeafToggleChange()">
            <span class="toggle-text">Leaf Toggle</span>
          </label>
        </div>

        @if (isLeaf()) {
          <div class="leaf-fields">
            <div class="form-row">
              <div class="form-group">
                <label for="pricePerHour">Price per Hour: <span class="required">*</span></label>
                <input 
                  type="number" 
                  id="pricePerHour" 
                  formControlName="pricePerHour" 
                  step="0.01"
                  class="form-control"
                  [class.error]="isFieldInvalid('pricePerHour')">
                @if (isFieldInvalid('pricePerHour')) {
                  <div class="error-message">Price per hour is required</div>
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
                      Number of slots is required
                    }
                    @if (siteForm.get('numberOfSlots')?.errors?.['min']) {
                      Minimum value is 1
                    }
                    @if (siteForm.get('numberOfSlots')?.errors?.['max']) {
                      Maximum value is 10000
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
                <div class="error-message">Integration code is required</div>
              }
            </div>



            <div class="polygon-status">
              <span class="status-label">Polygon Status:</span>
              <span class="status-value" [class.not-added]="!polygonAdded()" [class.added]="polygonAdded()">
                {{ polygonAdded() ? '✓ Added' : '■ Not Added' }}
              </span>
              <button type="button" class="add-polygon-btn" (click)="addPolygon()">
                {{ polygonAdded() ? 'Edit Polygon' : '+ Add Polygon' }}
              </button>
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
            [disabled]="!siteForm.valid || (isLeaf() && !polygonAdded())">
            Save
          </button>
          
          @if (isLeaf() && !polygonAdded() && siteForm.valid) {
            <div class="save-requirement-message">
              <small class="text-warning">
                ⚠️ Polygon must be added before saving a leaf site
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

  constructor(
    private fb: FormBuilder,
    private siteService: SiteService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.siteForm = this.createForm();
  }

  ngOnInit(): void {
    // First, try to restore any existing form data
    this.restoreFormData();

    const parentId = this.route.snapshot.queryParams['parentId'];
    const polygonAdded = this.route.snapshot.queryParams['polygonAdded'];

    // Check if returning from polygon form
    if (polygonAdded === 'true') {
      this.polygonAdded.set(true);
      // Save the polygon status to localStorage for persistence
      localStorage.setItem('polygonAdded', 'true');
    }

    // Handle parent site loading
    if (parentId) {
      this.siteService.getSiteById(parentId).subscribe(parent => {
        if (parent) {
          this.parentSite.set(parent);
          this.updateGeneratedPath();
        }
      });
    }

    // Watch for form changes to auto-save
    this.siteForm.valueChanges.subscribe(formValue => {
      this.saveFormData();
    });

    // Watch for name changes to update path
    this.siteForm.get('nameEn')?.valueChanges.subscribe(() => {
      this.updateGeneratedPath();
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nameEn: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      nameAr: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      isLeaf: [false],
      pricePerHour: [null],
      integrationCode: [''],
      numberOfSlots: [null, [Validators.min(1), Validators.max(10000)]]
    });
  }

  onLeafToggleChange(): void {
    const isLeafValue = this.siteForm.get('isLeaf')?.value;
    this.isLeaf.set(isLeafValue);

    if (isLeafValue) {
      // Add required validators for leaf fields
      this.siteForm.get('pricePerHour')?.setValidators([Validators.required]);
      this.siteForm.get('integrationCode')?.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(100)]);
      this.siteForm.get('numberOfSlots')?.setValidators([Validators.required, Validators.min(1), Validators.max(10000)]);
    } else {
      // Remove validators for leaf fields
      this.siteForm.get('pricePerHour')?.clearValidators();
      this.siteForm.get('integrationCode')?.clearValidators();
      this.siteForm.get('numberOfSlots')?.clearValidators();
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
        next: () => {
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

  private saveFormData(): void {
    const formData = {
      ...this.siteForm.value,
      parentId: this.parentSite()?.id,
      generatedPath: this.generatedPath(),
      polygonAdded: this.polygonAdded()
    };
    localStorage.setItem('addSiteFormData', JSON.stringify(formData));
  }

  private restoreFormData(): void {
    const savedData = localStorage.getItem('addSiteFormData');
    const polygonStatus = localStorage.getItem('polygonAdded');
    
    if (savedData) {
      try {
        const formData = JSON.parse(savedData);
        this.siteForm.patchValue(formData);
        this.isLeaf.set(formData.isLeaf || false);
        this.generatedPath.set(formData.generatedPath || '');
        
        if (formData.parentId) {
          this.siteService.getSiteById(formData.parentId).subscribe(parent => {
            if (parent) {
              this.parentSite.set(parent);
            }
          });
        }
        
        // Re-apply validators if it's a leaf
        if (formData.isLeaf) {
          setTimeout(() => this.onLeafToggleChange(), 0);
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

  private clearSavedData(): void {
    localStorage.removeItem('addSiteFormData');
    localStorage.removeItem('polygonAdded');
    sessionStorage.removeItem('tempSiteData');
  }

  goBack(): void {
    this.clearSavedData();
    this.router.navigate(['/admin']);
  }
}