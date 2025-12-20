import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Site } from '../../models/site.model';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-site-tree',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="site-tree">
      @for (site of sites; track site.id) {
        <div class="site-node">
          <div class="site-item" 
               [class.selected]="selectedSiteId === site.id"
               [class.highlighted-parent]="highlightedParents.has(site.id)"
               (click)="selectSite(site)">
            <span class="site-icon" [class.leaf]="site.type === 'leaf'">
              {{ site.type === 'leaf' ? '■' : '■' }}
            </span>
            <span class="site-name">{{ getSiteName(site) }}</span>
            @if (site.type === 'parent') {
              <button class="add-child-btn" 
                      (click)="onAddChildClick(site, $event)"
                      [title]="'ADMIN.ADD_SITE' | translate">
                +
              </button>
            }
          </div>
          
          @if (site.children && site.children.length > 0) {
            <div class="children" [class.expanded]="expandedNodes.has(site.id)">
              <app-site-tree 
                [sites]="site.children"
                [selectedSiteId]="selectedSiteId"
                [expandedNodes]="expandedNodes"
                [highlightedParents]="highlightedParents"
                (siteSelected)="onSiteSelected($event)"
                (addChild)="onAddChild($event)"
                (nodeToggled)="onNodeToggled($event)">
              </app-site-tree>
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './site-tree.component.scss'
})
export class SiteTreeComponent {
  @Input() sites: Site[] = [];
  @Input() selectedSiteId: string | null = null;
  @Input() expandedNodes: Set<string> = new Set();
  @Input() highlightedParents: Set<string> = new Set();
  
  @Output() siteSelected = new EventEmitter<Site>();
  @Output() addChild = new EventEmitter<Site>();
  @Output() nodeToggled = new EventEmitter<string>();

  constructor(private languageService: LanguageService) {}

  getSiteName(site: Site): string {
    const currentLang = this.languageService.getCurrentLanguage();
    return currentLang === 'ar' ? site.nameAr : site.nameEn;
  }

  selectSite(site: Site): void {
    this.siteSelected.emit(site);
    
    // Auto-expand parent nodes
    if (site.type === 'parent') {
      this.nodeToggled.emit(site.id);
    }
  }

  onAddChildClick(site: Site, event: Event): void {
    event.stopPropagation();
    this.addChild.emit(site);
  }

  onSiteSelected(site: Site): void {
    this.siteSelected.emit(site);
  }

  onAddChild(site: Site): void {
    this.addChild.emit(site);
  }

  onNodeToggled(nodeId: string): void {
    this.nodeToggled.emit(nodeId);
  }
}