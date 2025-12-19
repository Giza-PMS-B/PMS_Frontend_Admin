import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Site } from '../../models/site.model';

@Component({
  selector: 'app-site-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="site-details">
      @if (selectedSite) {
        <div class="details-content">
          <div class="detail-row">
            <label>Name:</label>
            <span>{{ selectedSite.nameEn }}</span>
          </div>
          
          <div class="detail-row">
            <label>Path:</label>
            <span class="path">{{ selectedSite.path }}</span>
          </div>
          
          <div class="detail-row">
            <label>Type:</label>
            <span class="type" [class.leaf]="selectedSite.type === 'leaf'">
              {{ selectedSite.type | titlecase }}
            </span>
          </div>

          @if (selectedSite.type === 'leaf') {
            <div class="leaf-details">
              <div class="detail-row">
                <label>Price per Hour:</label>
                <span class="price">{{ selectedSite.pricePerHour }} SAR</span>
              </div>
              
              <div class="detail-row">
                <label>Integration Code:</label>
                <span>{{ selectedSite.integrationCode }}</span>
              </div>
              
              <div class="detail-row">
                <label>Number of Slots:</label>
                <span>{{ selectedSite.numberOfSlots }}</span>
              </div>
              
              <div class="detail-row">
                <label>Polygons:</label>
                @if (selectedSite.polygons && selectedSite.polygons.length > 0) {
                  <div class="polygon-list">
                    @for (polygon of selectedSite.polygons; track polygon.id) {
                      <span class="polygon-name">{{ polygon.name }}</span>
                    }
                  </div>
                } @else {
                  <span class="polygon-status not-added">■ None Added</span>
                }
              </div>
            </div>
          }

          @if (selectedSite.type === 'leaf') {
            <div class="actions">
              <button class="btn btn-primary" (click)="editSite.emit(selectedSite)">
                Edit
              </button>
            </div>
          }
        </div>
      } @else {
        <div class="no-selection">
          <div class="placeholder-icon">📍</div>
          <p>Select a site from the tree to view details</p>
        </div>
      }
    </div>
  `,
  styleUrl: './site-details.component.scss'
})
export class SiteDetailsComponent {
  @Input() selectedSite: Site | null = null;
  
  @Output() editSite = new EventEmitter<Site>();
}