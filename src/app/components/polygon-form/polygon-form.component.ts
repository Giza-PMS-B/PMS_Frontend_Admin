import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SiteService } from '../../services/site.service';
import { Coordinate, CreatePolygonRequest } from '../../models/site.model';

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
                Polygon name is required
              }
              @if (polygonForm.get('polygonName')?.errors?.['minlength']) {
                Minimum length is 3 characters
              }
              @if (polygonForm.get('polygonName')?.errors?.['maxlength']) {
                Maximum length is 100 characters
              }
            </div>
          }
        </div>

        <div class="map-section">
          <h3>Map Area</h3>
          <div class="map-placeholder">
            <div class="map-instructions">
              <p>Click on the map to add points</p>
              <p class="note">Note: This is a placeholder. In a real implementation, integrate with a mapping service like Google Maps or Leaflet.</p>
            </div>
            <div class="mock-map" (click)="addPointFromMap($event)">
              <div class="map-grid"></div>
              @for (coordinate of coordinates(); track $index) {
                <div 
                  class="map-point" 
                  [style.left.%]="(coordinate.longitude + 180) / 360 * 100"
                  [style.top.%]="(90 - coordinate.latitude) / 180 * 100">
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
                <input 
                  type="number" 
                  formControlName="latitude" 
                  step="0.000001"
                  min="-90" 
                  max="90"
                  class="form-control"
                  [class.error]="isCoordinateFieldInvalid($index, 'latitude')">
                
                <input 
                  type="number" 
                  formControlName="longitude" 
                  step="0.000001"
                  min="-180" 
                  max="180"
                  class="form-control"
                  [class.error]="isCoordinateFieldInvalid($index, 'longitude')">
                
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
            + Add Coordinate
          </button>

          @if (coordinatesFormArray.length < 3) {
            <div class="validation-message">
              Minimum of 3 coordinates required
            </div>
          }
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="goBack()">
            Cancel
          </button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            [disabled]="!polygonForm.valid || coordinatesFormArray.length < 3">
            {{ isEdit() ? 'Update Polygon' : 'Save Polygon' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrl: './polygon-form.component.scss'
})
export class PolygonFormComponent implements OnInit {
  polygonForm: FormGroup;
  siteId = signal<string>('');
  isEdit = signal<boolean>(false);
  coordinates = signal<Coordinate[]>([]);

  constructor(
    private fb: FormBuilder,
    private siteService: SiteService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.polygonForm = this.createForm();
  }

  ngOnInit(): void {
    this.siteId.set(this.route.snapshot.queryParams['siteId'] || '');
    
    // Add initial coordinates
    this.addCoordinate();
    this.addCoordinate();
    this.addCoordinate();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      polygonName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      coordinates: this.fb.array([])
    });
  }

  get coordinatesFormArray(): FormArray {
    return this.polygonForm.get('coordinates') as FormArray;
  }

  private createCoordinateGroup(lat: number = 0, lng: number = 0): FormGroup {
    return this.fb.group({
      latitude: [lat, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: [lng, [Validators.required, Validators.min(-180), Validators.max(180)]]
    });
  }

  addCoordinate(): void {
    this.coordinatesFormArray.push(this.createCoordinateGroup());
    this.updateCoordinatesSignal();
  }

  removeCoordinate(index: number): void {
    if (this.coordinatesFormArray.length > 3) {
      this.coordinatesFormArray.removeAt(index);
      this.updateCoordinatesSignal();
    }
  }

  addPointFromMap(event: MouseEvent): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    
    // Convert to approximate lat/lng (this is just for demo)
    const lng = (x * 360) - 180;
    const lat = 90 - (y * 180);
    
    this.coordinatesFormArray.push(this.createCoordinateGroup(
      Math.round(lat * 1000000) / 1000000,
      Math.round(lng * 1000000) / 1000000
    ));
    this.updateCoordinatesSignal();
  }

  private updateCoordinatesSignal(): void {
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
    if (this.polygonForm.valid && this.coordinatesFormArray.length >= 3) {
      const formValue = this.polygonForm.value;
      const request: CreatePolygonRequest = {
        name: formValue.polygonName,
        coordinates: formValue.coordinates,
        siteId: this.siteId()
      };

      // For demo purposes, just simulate polygon creation
      console.log('Polygon created:', request);

      // Set polygon as added in localStorage
      localStorage.setItem('polygonAdded', 'true');

      // Show success message briefly
      alert('Polygon saved successfully!');

      // Check where to return
      const returnTo = this.route.snapshot.queryParams['returnTo'];
      if (returnTo === 'add-site') {
        // Return to add-site form with polygon added flag
        this.router.navigate(['/admin/add-site'], {
          queryParams: { polygonAdded: 'true' }
        });
      } else {
        // Return to admin dashboard
        this.router.navigate(['/admin']);
      }
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