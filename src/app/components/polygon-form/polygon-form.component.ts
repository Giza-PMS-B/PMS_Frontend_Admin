import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SiteService } from '../../services/site.service';
import { Coordinate, CreatePolygonRequest } from '../../models/site.model';
import { CustomValidators } from '../../validators/custom-validators';

@Component({
  selector: 'app-polygon-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="polygon-form-container">
      <div class="form-header">
        <h2>{{ isEdit() ? 'Edit Polygon' : 'Add Polygon' }}</h2>
        <button class="close-btn" (click)="goBack()">×</button>
      </div>

      <form [formGroup]="polygonForm" (ngSubmit)="onSubmit()" class="polygon-form">
        <div class="form-group">
          <label for="polygonName">Polygon Name: <span class="required">*</span></label>
          <input 
            type="text" 
            id="polygonName" 
            formControlName="polygonName" 
            class="form-control"
            [class.error]="isFieldInvalid('polygonName')">
          @if (isFieldInvalid('polygonName')) {
            <div class="error-message">
              @if (polygonForm.get('polygonName')?.errors?.['required']) {
                <div>This field is required</div>
              }
              @if (polygonForm.get('polygonName')?.errors?.['minlength'] || polygonForm.get('polygonName')?.errors?.['maxlength']) {
                <div>The polygon name must contain number of characters in the range 3 to 100 characters</div>
              }
              @if (polygonForm.get('polygonName')?.errors?.['mixedText']) {
                <div>Only Arabic/English letters, numbers, and basic punctuation are allowed</div>
              }
              @if (polygonForm.get('polygonName')?.errors?.['uniquePolygonName']) {
                <div>This polygon name is already in use</div>
              }
            </div>
          }
        </div>

        <div class="map-section">
          <h3>Map Area</h3>
          <div class="map-placeholder">
            <div class="map-instructions">
              <p>Map displays the coordinates entered below</p>
              <p class="note">Note: This is a placeholder. In a real implementation, integrate with a mapping service like Google Maps or Leaflet.</p>
            </div>
            <div class="mock-map readonly-map">
              <div class="map-grid"></div>
              @for (coordinate of coordinates(); track $index) {
                <div 
                  class="map-point" 
                  [style.left.%]="getMapX(coordinate.longitude)"
                  [style.top.%]="getMapY(coordinate.latitude)">
                  {{ $index + 1 }}
                </div>
              }
            </div>
          </div>
        </div>

        <div class="coordinates-section">
          <h3>Coordinates List</h3>
          <div class="coordinates-header">
            <span>Latitude</span>
            <span>Longitude</span>
            <span>Actions</span>
          </div>
          
          <div formArrayName="coordinates" class="coordinates-list">
            @for (coordinate of coordinatesFormArray.controls; track $index) {
              <div [formGroupName]="$index" class="coordinate-row">
                <div class="coordinate-input-group">
                  <input 
                    type="number" 
                    formControlName="latitude" 
                    step="0.000001"
                    class="form-control"
                    [class.error]="isCoordinateFieldInvalid($index, 'latitude')"
                    (input)="updateCoordinatesSignal()"
                    placeholder="Latitude">
                  @if (isCoordinateFieldInvalid($index, 'latitude')) {
                    <div class="coordinate-error">
                      @if (coordinatesFormArray.at($index).get('latitude')?.errors?.['required']) {
                        <div>This field is required</div>
                      }
                      @if (coordinatesFormArray.at($index).get('latitude')?.errors?.['invalidLatitude']) {
                        <div>Invalid number</div>
                      }
                      @if (coordinatesFormArray.at($index).get('latitude')?.errors?.['latitudeRange']) {
                        <div>Range: -90 to +90</div>
                      }
                      @if (coordinatesFormArray.at($index).get('latitude')?.errors?.['latitudeDecimalPlaces']) {
                        <div>Max 6 decimal places</div>
                      }
                    </div>
                  }
                </div>
                
                <div class="coordinate-input-group">
                  <input 
                    type="number" 
                    formControlName="longitude" 
                    step="0.000001"
                    class="form-control"
                    [class.error]="isCoordinateFieldInvalid($index, 'longitude')"
                    (input)="updateCoordinatesSignal()"
                    placeholder="Longitude">
                  @if (isCoordinateFieldInvalid($index, 'longitude')) {
                    <div class="coordinate-error">
                      @if (coordinatesFormArray.at($index).get('longitude')?.errors?.['required']) {
                        <div>This field is required</div>
                      }
                      @if (coordinatesFormArray.at($index).get('longitude')?.errors?.['invalidLongitude']) {
                        <div>Invalid number</div>
                      }
                      @if (coordinatesFormArray.at($index).get('longitude')?.errors?.['longitudeRange']) {
                        <div>Range: -180 to +180</div>
                      }
                      @if (coordinatesFormArray.at($index).get('longitude')?.errors?.['longitudeDecimalPlaces']) {
                        <div>Max 6 decimal places</div>
                      }
                    </div>
                  }
                </div>
                
                <button 
                  type="button" 
                  class="remove-btn" 
                  (click)="removeCoordinate($index)"
                  [disabled]="coordinatesFormArray.length <= 1">
                  ×
                </button>
              </div>
            }
          </div>

          <button type="button" class="add-coordinate-btn" (click)="addCoordinate()">
            + Add Coordinate
          </button>

          @if (coordinatesFormArray.length < 3) {
            <div class="validation-message">
              Minimum of 3 coordinates required for a valid polygon
            </div>
          }
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="goBack()">
            Cancel
          </button>
          <button 
            type="submit" 
            class="btn btn-primary">
            {{ isEdit() ? 'Update Polygon' : 'Save Polygon' }}
          </button>
        </div>
      </form>

      @if (showMessage()) {
        <div class="success-message">
          <div class="message-content">
            <span class="success-icon">✓</span>
            <span class="message-text">{{ message() }}</span>
          </div>
        </div>
      }

      @if (showErrorMessage()) {
        <div class="error-message-toast">
          <div class="message-content">
            <span class="error-icon">✕</span>
            <span class="message-text">{{ errorMessage() }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './polygon-form.component.scss'
})
export class PolygonFormComponent implements OnInit {
  polygonForm: FormGroup;
  siteId = signal<string>('');
  isEdit = signal<boolean>(false);
  coordinates = signal<Coordinate[]>([]);
  showMessage = signal<boolean>(false);
  message = signal<string>('');
  showErrorMessage = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private siteService: SiteService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.polygonForm = this.createForm();
  }

  ngOnInit(): void {
    const siteId = this.route.snapshot.queryParams['siteId'] || '';
    const mode = this.route.snapshot.queryParams['mode'] || 'add';
    
    this.siteId.set(siteId);
    this.isEdit.set(mode === 'edit');
    
    console.log('Polygon form initialized with siteId:', siteId, 'mode:', mode);
    
    if (this.isEdit() && siteId && siteId !== 'temp-site-id') {
      // Load existing polygon data for editing
      this.loadExistingPolygon(siteId);
    } else {
      // Add initial coordinate at (0, 0) for new polygons
      this.addCoordinate();
    }
  }

  private createForm(): FormGroup {
    const excludeId = this.isEdit() ? this.siteId() : undefined;
    
    return this.fb.group({
      polygonName: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(100),
        CustomValidators.mixedText()
      ]],
      coordinates: this.fb.array([])
    });
  }

  get coordinatesFormArray(): FormArray {
    return this.polygonForm.get('coordinates') as FormArray;
  }

  private createCoordinateGroup(lat: number = 0, lng: number = 0): FormGroup {
    return this.fb.group({
      latitude: [lat, [Validators.required, CustomValidators.latitude()]],
      longitude: [lng, [Validators.required, CustomValidators.longitude()]]
    });
  }

  addCoordinate(): void {
    const newCoordinate = this.createCoordinateGroup(0, 0);
    this.coordinatesFormArray.push(newCoordinate);
    
    // Subscribe to changes in the new coordinate inputs
    newCoordinate.valueChanges.subscribe(() => {
      this.updateCoordinatesSignal();
    });
    
    this.updateCoordinatesSignal();
  }

  removeCoordinate(index: number): void {
    if (this.coordinatesFormArray.length > 1) {
      this.coordinatesFormArray.removeAt(index);
      this.updateCoordinatesSignal();
    }
  }



  updateCoordinatesSignal(): void {
    const coords: Coordinate[] = this.coordinatesFormArray.value;
    this.coordinates.set(coords);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.polygonForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isCoordinateFieldInvalid(index: number, fieldName: string): boolean {
    const field = this.coordinatesFormArray.at(index).get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    this.markFormGroupTouched(this.polygonForm);
    
    if (this.polygonForm.valid && this.coordinatesFormArray.length >= 3) {
      const formValue = this.polygonForm.value;
      const request: CreatePolygonRequest = {
        name: formValue.polygonName,
        coordinates: formValue.coordinates,
        siteId: this.siteId()
      };

      const returnTo = this.route.snapshot.queryParams['returnTo'];
      
      if (returnTo === 'add-site') {
        // For new sites: store polygon data temporarily
        localStorage.setItem('polygonAdded', 'true');
        localStorage.setItem('tempPolygonData', JSON.stringify({
          name: request.name,
          coordinates: request.coordinates
        }));
        
        this.showSuccessMessage();
      } else {
        // For existing sites: create or update the polygon
        const action = this.isEdit() ? 'Updating' : 'Creating';
        console.log(`${action} polygon for existing site:`, request);
        
        this.siteService.createPolygon(request).subscribe({
          next: (polygon) => {
            console.log(`Polygon ${this.isEdit() ? 'updated' : 'created'} successfully:`, polygon);
            // Refresh the selected site to show updated polygon status
            this.siteService.getSiteById(this.siteId()).subscribe(updatedSite => {
              if (updatedSite) {
                this.siteService.selectSite(updatedSite);
              }
            });
            
            this.showSuccessMessage();
          },
          error: (error) => {
            console.error(`Error ${this.isEdit() ? 'updating' : 'creating'} polygon:`, error);
            alert(`Error ${this.isEdit() ? 'updating' : 'saving'} polygon. Please try again.`);
          }
        });
      }
    } else {
      // Show generic validation error
      this.showValidationError('Fill all required fields');
    }
  }

  private showValidationError(message: string): void {
    this.errorMessage.set(message);
    this.showErrorMessage.set(true);
    
    // Hide error message after 3 seconds
    setTimeout(() => {
      this.showErrorMessage.set(false);
    }, 3000);
  }

  getMapX(longitude: number): number {
    // Convert longitude (-180 to 180) to percentage (0 to 100)
    return ((longitude + 180) / 360) * 100;
  }

  getMapY(latitude: number): number {
    // Convert latitude (-90 to 90) to percentage (0 to 100)
    // Note: Map Y is inverted (0 at top, 100 at bottom)
    return ((90 - latitude) / 180) * 100;
  }

  private loadExistingPolygon(siteId: string): void {
    this.siteService.getSiteById(siteId).subscribe(site => {
      if (site && site.polygon) {
        console.log('Loading existing polygon:', site.polygon);
        
        // Set polygon name
        this.polygonForm.get('polygonName')?.setValue(site.polygon.name);
        
        // Clear existing coordinates
        while (this.coordinatesFormArray.length > 0) {
          this.coordinatesFormArray.removeAt(0);
        }
        
        // Load existing coordinates
        if (site.polygon.coordinates && site.polygon.coordinates.length > 0) {
          site.polygon.coordinates.forEach(coord => {
            this.addCoordinateWithValues(coord.latitude, coord.longitude);
          });
        } else {
          // Fallback: add one coordinate if no coordinates exist
          this.addCoordinate();
        }
      } else {
        console.log('No existing polygon found, starting with empty form');
        this.addCoordinate();
      }
    });
  }

  private addCoordinateWithValues(lat: number, lng: number): void {
    const newCoordinate = this.createCoordinateGroup(lat, lng);
    this.coordinatesFormArray.push(newCoordinate);
    
    // Subscribe to changes in the new coordinate inputs
    newCoordinate.valueChanges.subscribe(() => {
      this.updateCoordinatesSignal();
    });
    
    this.updateCoordinatesSignal();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      }
    });
  }

  private showSuccessMessage(): void {
    const message = this.isEdit() ? 'Polygon updated successfully!' : 'Polygon saved successfully!';
    this.message.set(message);
    this.showMessage.set(true);
    
    // Hide message and navigate after 1.5 seconds
    setTimeout(() => {
      this.showMessage.set(false);
      
      // Navigate after message disappears
      setTimeout(() => {
        const returnTo = this.route.snapshot.queryParams['returnTo'];
        if (returnTo === 'add-site') {
          // For new sites: return to add-site form
          this.router.navigate(['/admin/add-site'], {
            queryParams: { polygonAdded: 'true' }
          });
        } else {
          // For existing sites: go to dashboard and select the site
          this.navigateToSiteInDashboard();
        }
      }, 300);
    }, 1500);
  }

  private navigateToSiteInDashboard(): void {
    const siteId = this.siteId();
    if (siteId && siteId !== 'temp-site-id') {
      // Get the site and select it in the dashboard
      this.siteService.getSiteById(siteId).subscribe(site => {
        if (site) {
          this.siteService.selectSite(site);
        }
        this.router.navigate(['/admin']);
      });
    } else {
      // Fallback to just navigate to admin
      this.router.navigate(['/admin']);
    }
  }

  goBack(): void {
    const returnTo = this.route.snapshot.queryParams['returnTo'];
    if (returnTo === 'add-site') {
      // Return to add-site form without polygon
      this.router.navigate(['/admin/add-site']);
    } else {
      // Return to admin dashboard
      this.router.navigate(['/admin']);
    }
  }
}