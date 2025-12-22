import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Site } from '../../models/site.model';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-site-details',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="site-details">
      @if (selectedSite) {
        <div class="details-content">
          <div class="detail-row">
            <label>{{ 'SITE.NAME' | translate }}:</label>
            <span>{{ getCurrentSiteName() }}</span>
          </div>
          
          <div class="detail-row">
            <label>{{ 'SITE.PATH' | translate }}:</label>
            <span class="path">{{ selectedSite.path }}</span>
          </div>
          
          <div class="detail-row">
            <label>{{ 'SITE.TYPE' | translate }}:</label>
            <span class="type" [class.leaf]="selectedSite.type === 'leaf'">
              {{ selectedSite.type === 'leaf' ? ('SITE.LEAF' | translate) : ('SITE.PARENT' | translate) }}
            </span>
          </div>

          @if (selectedSite.type === 'leaf') {
            <div class="leaf-details">
              <div class="detail-row">
                <label>{{ 'SITE.PRICE_PER_HOUR' | translate }}:</label>
                <span class="price">{{ selectedSite.pricePerHour }} SAR</span>
              </div>
              
              <div class="detail-row">
                <label>{{ 'SITE.INTEGRATION_CODE' | translate }}:</label>
                <span>{{ selectedSite.integrationCode }}</span>
              </div>
              
              <div class="detail-row">
                <label>{{ 'SITE.NUMBER_OF_SLOTS' | translate }}:</label>
                <span>{{ selectedSite.numberOfSlots }}</span>
              </div>
              
              <div class="detail-row">
                <label>{{ 'SITE.POLYGONS' | translate }}:</label>
                @if (selectedSite.polygons && selectedSite.polygons.length > 0) {
                  <div class="polygon-list">
                    @for (polygon of selectedSite.polygons; track polygon.id) {
                      <span class="polygon-name">{{ polygon.name }}</span>
                    }
                  </div>
                } @else {
                  <span class="polygon-status not-added">■ {{ 'SITE.NONE_ADDED' | translate }}</span>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="no-selection">
          <div class="placeholder-icon">📍</div>
          <p>{{ 'MESSAGES.SELECT_SITE' | translate }}</p>
        </div>
      }
    </div>
  `,
  styleUrl: './site-details.component.scss'
})
export class SiteDetailsComponent {
  @Input() selectedSite: Site | null = null;

  constructor(private languageService: LanguageService) {}

  getCurrentSiteName(): string {
    if (!this.selectedSite) return '';
    
    const currentLang = this.languageService.getCurrentLanguage();
    return currentLang === 'ar' ? this.selectedSite.nameAr : this.selectedSite.nameEn;
  }
}