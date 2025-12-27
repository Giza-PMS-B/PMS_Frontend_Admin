import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SiteService } from '../../services/site.service';
import { LanguageService } from '../../services/language.service';
import { Coordinate, CreatePolygonRequest } from '../../models/site.model';
import { CustomValidators } from '../../validators/custom-validators';

@Component({
  selector: 'app-polygon-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="polygon-form-container">
      <div class="form-header">
        <h2>{{ isEdit() ? ('POLYGON.EDIT_POLYGON' | translate) : ('POLYGON.ADD_POLYGON' | translate) }}</h2>
        <button class="close-btn" (click)="goBack()">×</button>
      </div>

      <form [formGroup]="polygonForm" (ngSubmit)="onSubmit()" class="polygon-form">
        <div class="form-group">
          <label for="polygonName">{{ 'POLYGON.POLYGON_NAME' | translate }}: <span class="required">*</span></label>
          <input 
            type="text" 
            id="polygonName" 
            formControlName="polygonName" 
            class="form-control"
            [class.error]="isFieldInvalid('polygonName')">
          @if (isFieldInvalid('polygonName')) {
            <div class="error-message">
              @if (polygonForm.get('polygonName')?.errors?.['required']) {
                <div>• {{ 'VALIDATION.REQUIRED' | translate }}</div>
              }
              @if (polygonForm.get('polygonName')?.errors?.['minlength'] || polygonForm.get('polygonName')?.errors?.['maxlength']) {
                <div>• {{ 'VALIDATION.POLYGON_NAME_LENGTH' | translate }}</div>
              }
              @if (polygonForm.get('polygonName')?.errors?.['mixedText']) {
                <div>• {{ 'VALIDATION.MIXED_TEXT' | translate }}</div>
              }
              @if (polygonForm.get('polygonName')?.errors?.['mixedTextSpecialOnly']) {
                <div>• {{ 'VALIDATION.MIXED_TEXT_SPECIAL_ONLY' | translate }}</div>
              }
              @if (polygonForm.get('polygonName')?.errors?.['uniquePolygonName']) {
                <div>• {{ 'VALIDATION.UNIQUE_POLYGON' | translate }}</div>
              }
            </div>
          }
        </div>

        <div class="map-section">
          <h3>{{ 'POLYGON.MAP_AREA' | translate }}</h3>
          <div class="map-placeholder">
            <div class="map-instructions">
              <p>{{ 'POLYGON.MAP_INSTRUCTIONS' | translate }}</p>
              <p class="note">{{ 'POLYGON.MAP_NOTE' | translate }}</p>
            </div>
            <div class="mock-map readonly-map">
              <div class="map-grid"></div>
              @for (coordinate of coordinates(); track $index) {
                @if (coordinate.latitude !== null && coordinate.longitude !== null && 
                     isValidNumber(coordinate.latitude) && isValidNumber(coordinate.longitude)) {
                  <div 
                    class="map-point" 
                    [style.left.%]="getMapX(coordinate.longitude)"
                    [style.top.%]="getMapY(coordinate.latitude)">
                    {{ $index + 1 }}
                  </div>
                }
              }
            </div>
          </div>
        </div>

        <div class="coordinates-section">
          <h3>{{ 'POLYGON.COORDINATES_LIST' | translate }} <span class="min-coordinates-text">({{ 'POLYGON.MIN_COORDINATES' | translate }})</span></h3>
          <div class="coordinates-header">
            <span>#</span>
            <span>{{ 'POLYGON.LATITUDE' | translate }}</span>
            <span>{{ 'POLYGON.LONGITUDE' | translate }}</span>
            <span>{{ 'POLYGON.ACTIONS' | translate }}</span>
          </div>
          
          <div formArrayName="coordinates" class="coordinates-list">
            @for (coordinate of coordinatesFormArray.controls; track $index) {
              <div [formGroupName]="$index" class="coordinate-row">
                <div class="coordinate-number">
                  {{ $index + 1 }}
                </div>
                <div class="coordinate-input-group">
                  <input 
                    type="number" 
                    formControlName="latitude" 
                    step="0.000001"
                    class="form-control"
                    [class.error]="isCoordinateFieldInvalid($index, 'latitude')"
                    (input)="updateCoordinatesSignal()"
                    placeholder="0">
                  @if (isCoordinateFieldInvalid($index, 'latitude')) {
                    <div class="coordinate-error">
                      @if (coordinatesFormArray.at($index).get('latitude')?.errors?.['required']) {
                        <div>• {{ 'VALIDATION.REQUIRED' | translate }}</div>
                      }
                      @if (coordinatesFormArray.at($index).get('latitude')?.errors?.['latitudeInvalidFormat']) {
                        <div>• {{ 'VALIDATION.LATITUDE_INVALID_FORMAT' | translate }}</div>
                      }
                      @if (coordinatesFormArray.at($index).get('latitude')?.errors?.['invalidLatitude']) {
                        <div>• {{ 'VALIDATION.INVALID_NUMBER' | translate }}</div>
                      }
                      @if (coordinatesFormArray.at($index).get('latitude')?.errors?.['latitudeRange']) {
                        <div>• {{ 'VALIDATION.LATITUDE_RANGE' | translate }}</div>
                      }
                      @if (coordinatesFormArray.at($index).get('latitude')?.errors?.['latitudeDecimalPlaces']) {
                        <div>• {{ 'VALIDATION.DECIMAL_PLACES' | translate }}</div>
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
                    placeholder="0">
                  @if (isCoordinateFieldInvalid($index, 'longitude')) {
                    <div class="coordinate-error">
                      @if (coordinatesFormArray.at($index).get('longitude')?.errors?.['required']) {
                        <div>• {{ 'VALIDATION.REQUIRED' | translate }}</div>
                      }
                      @if (coordinatesFormArray.at($index).get('longitude')?.errors?.['longitudeInvalidFormat']) {
                        <div>• {{ 'VALIDATION.LONGITUDE_INVALID_FORMAT' | translate }}</div>
                      }
                      @if (coordinatesFormArray.at($index).get('longitude')?.errors?.['invalidLongitude']) {
                        <div>• {{ 'VALIDATION.INVALID_NUMBER' | translate }}</div>
                      }
                      @if (coordinatesFormArray.at($index).get('longitude')?.errors?.['longitudeRange']) {
                        <div>• {{ 'VALIDATION.LONGITUDE_RANGE' | translate }}</div>
                      }
                      @if (coordinatesFormArray.at($index).get('longitude')?.errors?.['longitudeDecimalPlaces']) {
                        <div>• {{ 'VALIDATION.DECIMAL_PLACES' | translate }}</div>
                      }
                    </div>
                  }
                </div>
                
                <button 
                  type="button" 
                  class="remove-btn" 
                  (click)="removeCoordinate($index)"
                  [disabled]="coordinatesFormArray.length <= 3">
                  ×
                </button>
              </div>
            }
          </div>

          <button type="button" class="add-coordinate-btn" (click)="addCoordinate()">
            + {{ 'POLYGON.ADD_COORDINATE' | translate }}
          </button>

          @if (coordinatesFormArray.length < 3) {
            <div class="coordinates-info">
              <span class="info-icon">ⓘ</span>
              <span class="info-text">{{ 'POLYGON.MIN_COORDINATES' | translate }}</span>
            </div>
          }

          @if (coordinatesFormArray.errors?.['duplicateCoordinates']) {
            <div class="validation-message error">
              • {{ 'POLYGON.DUPLICATE_POINTS' | translate }}
            </div>
          }
        </div>

        <div class="form-actions">
          <button
            type="button"
            id="cancel-polygon-btn"
            class="btn btn-secondary"
            (click)="goBack()">
            {{ 'COMMON.CANCEL' | translate }}
          </button>
          <button
            type="submit"
            id="save-polygon-btn"
            class="btn btn-primary"
            [disabled]="!isFormReady()">
            {{ isEdit() ? ('POLYGON.UPDATE_POLYGON' | translate) : ('POLYGON.SAVE_POLYGON' | translate) }}
          </button>
        </div>
      </form>

      @if (showMessage()) {
        <div class="success-message">
          <div class="message-content">
            <span class="success-icon">✓</span>
            <span class="message-text">{{ message() | translate }}</span>
          </div>
        </div>
      }

      @if (showErrorMessage()) {
        <div class="error-message-toast">
          <div class="message-content">
            <span class="error-icon">✕</span>
            <span class="message-text">{{ errorMessage() | translate }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './polygon-form.component.scss'
})
export class PolygonFormComponent implements OnInit, OnDestroy {
  polygonForm: FormGroup;
  siteId = signal<string>('');
  isEdit = signal<boolean>(false);
  coordinates = signal<Coordinate[]>([]);
  showMessage = signal<boolean>(false);
  message = signal<string>('');
  showErrorMessage = signal<boolean>(false);
  errorMessage = signal<string>('');
  private coordinateCounter = 1; // Counter for unique coordinate identifiers

  constructor(
    private fb: FormBuilder,
    private siteService: SiteService,
    private router: Router,
    private route: ActivatedRoute,
    private languageService: LanguageService
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
      // Add 3 initial coordinates for new polygons (minimum required for a polygon)
      this.addCoordinate(); // Coordinate 1
      this.addCoordinate(); // Coordinate 2
      this.addCoordinate(); // Coordinate 3
    }
  }

  ngOnDestroy(): void {
    // Clear temporary polygon data when navigating away without saving
    // Only clear if we haven't successfully saved (showMessage indicates success)
    if (!this.showMessage()) {
      console.log('Polygon form destroyed - clearing unsaved temporary data');
      // Don't clear tempPolygonData here as it might be needed by add-site form
      // Only clear if we're completely abandoning the flow
      const returnTo = this.route.snapshot.queryParams['returnTo'];
      if (!returnTo || returnTo === 'admin') {
        localStorage.removeItem('tempPolygonData');
      }
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      polygonName: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(100),
        CustomValidators.mixedText()
      ]],
      coordinates: this.fb.array([], [CustomValidators.noDuplicateCoordinates()])
    });
  }

  get coordinatesFormArray(): FormArray {
    return this.polygonForm.get('coordinates') as FormArray;
  }

  private createCoordinateGroup(lat?: number, lng?: number): FormGroup {
    return this.fb.group({
      latitude: [lat ?? null, [Validators.required, CustomValidators.latitude()]],
      longitude: [lng ?? null, [Validators.required, CustomValidators.longitude()]]
    });
  }

  addCoordinate(): void {
    const newCoordinate = this.createCoordinateGroup();
    this.coordinatesFormArray.push(newCoordinate);
    
    // Subscribe to changes in the new coordinate inputs
    newCoordinate.valueChanges.subscribe(() => {
      this.updateCoordinatesSignal();
    });
    
    this.updateCoordinatesSignal();
  }

  removeCoordinate(index: number): void {
    if (this.coordinatesFormArray.length > 3) {
      this.coordinatesFormArray.removeAt(index);
      this.updateCoordinatesSignal();
    }
  }



  updateCoordinatesSignal(): void {
    const coords: Coordinate[] = this.coordinatesFormArray.value.map((coord: any) => ({
      latitude: coord.latitude !== null && coord.latitude !== '' && coord.latitude !== undefined ? parseFloat(coord.latitude) : null,
      longitude: coord.longitude !== null && coord.longitude !== '' && coord.longitude !== undefined ? parseFloat(coord.longitude) : null
    }));
    
    console.log('Updated coordinates:', coords); // Debug log
    this.coordinates.set(coords);
    // Trigger validation to check for duplicate coordinates
    this.coordinatesFormArray.updateValueAndValidity();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.polygonForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isCoordinateFieldInvalid(index: number, fieldName: string): boolean {
    const field = this.coordinatesFormArray.at(index).get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isFormReady(): boolean {
    // Check if form is valid
    const formValid = this.polygonForm.valid;
    
    // Check if we have at least 3 coordinates
    const hasMinCoordinates = this.coordinatesFormArray.length >= 3;
    
    // Check if all coordinate fields are filled and valid
    const coordinatesValid = this.coordinatesFormArray.controls.every(control => {
      const lat = control.get('latitude');
      const lng = control.get('longitude');
      return lat?.valid && lng?.valid && lat?.value !== null && lng?.value !== null;
    });
    
    return formValid && hasMinCoordinates && coordinatesValid;
  }

  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    this.markFormGroupTouched(this.polygonForm);

    // The form should be valid at this point since the button is disabled when invalid
    // But we'll keep this check as a safety measure
    if (this.polygonForm.valid && this.coordinatesFormArray.length >= 3) {
      const formValue = this.polygonForm.value;
      const request: CreatePolygonRequest = {
        name: formValue.polygonName,
        coordinates: formValue.coordinates,
        siteId: this.siteId()
      };

      const returnTo = this.route.snapshot.queryParams['returnTo'];

      if (returnTo === 'add-site') {
        // Check for duplicate polygon name in temporary storage
        if (this.isDuplicatePolygonName(request.name)) {
          this.displayBackendError({
            error: {
              error: 'Polygon name already exists. Please use a different name.'
            }
          });
          return;
        }

        // For new sites: store polygon data temporarily (support multiple polygons)
        this.addPolygonToTempStorage({
          name: request.name,
          coordinates: request.coordinates
        });
        localStorage.setItem('polygonAdded', 'true');

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
            this.displayBackendError(error);
          }
        });
      }
    }
    // Removed the else block that showed validation error since button is now disabled
  }

  /**
   * Display backend error message
   */
  private displayBackendError(error: any): void {
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
    this.showErrorMessage.set(true);

    // Hide error message after 5 seconds
    setTimeout(() => {
      this.showErrorMessage.set(false);
    }, 5000);
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

  isValidNumber(value: any): boolean {
    return value !== null && value !== undefined && !Number.isNaN(value);
  }

  private loadExistingPolygon(siteId: string): void {
    this.siteService.getSiteById(siteId).subscribe(site => {
      if (site && site.polygons && site.polygons.length > 0) {
        // For now, load the first polygon (since we're transitioning from single to multiple)
        const polygon = site.polygons[0];
        console.log('Loading existing polygon:', polygon);
        
        // Set polygon name
        this.polygonForm.get('polygonName')?.setValue(polygon.name);
        
        // Clear existing coordinates
        while (this.coordinatesFormArray.length > 0) {
          this.coordinatesFormArray.removeAt(0);
        }
        
        // Load existing coordinates
        if (polygon.coordinates && polygon.coordinates.length > 0) {
          polygon.coordinates.forEach((coord: Coordinate) => {
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
    const message = this.isEdit() ? 'MESSAGES.POLYGON_UPDATED' : 'MESSAGES.POLYGON_CREATED';
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
        } else if (returnTo === 'edit-site') {
          // For editing existing sites: return to edit form
          const siteId = this.siteId();
          this.router.navigate(['/admin/add-site'], {
            queryParams: { 
              siteId: siteId,
              mode: 'edit',
              polygonAdded: 'true'
            }
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

  private addPolygonToTempStorage(polygonData: { name: string; coordinates: Coordinate[] }): void {
    try {
      // Get existing temp polygons or initialize empty array
      const existingPolygons = this.getTempPolygons();
      
      // Add new polygon to the array
      existingPolygons.push(polygonData);
      
      // Save back to localStorage
      localStorage.setItem('tempPolygonData', JSON.stringify(existingPolygons));
      
      console.log('Added polygon to temp storage. Total polygons:', existingPolygons.length);
    } catch (error) {
      console.error('Error adding polygon to temp storage:', error);
    }
  }

  private getTempPolygons(): { name: string; coordinates: Coordinate[] }[] {
    try {
      const stored = localStorage.getItem('tempPolygonData');
      if (stored) {
        const parsed = JSON.parse(stored);
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
      console.error('Error getting temp polygons:', error);
      return [];
    }
  }

  /**
   * Check if a polygon with the given name already exists in temporary storage
   */
  private isDuplicatePolygonName(name: string): boolean {
    const existingPolygons = this.getTempPolygons();
    const trimmedName = name.trim().toLowerCase();

    return existingPolygons.some(polygon =>
      polygon.name.trim().toLowerCase() === trimmedName
    );
  }

  goBack(): void {
    // Clear temporary data when explicitly going back/canceling
    if (!this.showMessage()) {
      console.log('Explicitly going back from polygon form - clearing temporary data');
      const returnTo = this.route.snapshot.queryParams['returnTo'];
      if (!returnTo || returnTo === 'admin') {
        localStorage.removeItem('tempPolygonData');
      }
    }

    const returnTo = this.route.snapshot.queryParams['returnTo'];
    if (returnTo === 'add-site') {
      // Return to add-site form - add parameter to indicate we're returning from polygon
      console.log('Returning to add-site form from polygon form');
      this.router.navigate(['/admin/add-site'], {
        queryParams: { returnFrom: 'polygon' }
      });
    } else if (returnTo === 'edit-site') {
      // Return to edit form
      const siteId = this.siteId();
      this.router.navigate(['/admin/add-site'], {
        queryParams: { 
          siteId: siteId,
          mode: 'edit'
        }
      });
    } else {
      // Return to admin dashboard
      this.router.navigate(['/admin']);
    }
  }
}