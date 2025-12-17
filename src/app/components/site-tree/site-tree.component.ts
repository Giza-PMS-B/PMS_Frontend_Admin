import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Site } from '../../models/site.model';

@Component({
  selector: 'app-site-tree',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="site-tree">
      @for (site of sites; track site.id) {
        <div class="site-node">
          <div class="site-item" 
               [class.selected]="selectedSiteId === site.id"
               (click)="selectSite(site)">
            <span class="site-icon" [class.leaf]="site.type === 'leaf'">
              {{ site.type === 'leaf' ? '■' : '■' }}
            </span>
            <span class="site-name">{{ site.nameEn }}</span>
            @if (site.type === 'parent') {
              <button class="add-child-btn" 
                      (click)="onAddChildClick(site, $event)"
                      title="Add Child Site">
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
                (siteSelected)="onSiteSelected($event)"
                (addChild)="onAddChild($event)">
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
  
  @Output() siteSelected = new EventEmitter<Site>();
  @Output() addChild = new EventEmitter<Site>();

  selectSite(site: Site): void {
    this.selectedSiteId = site.id;
    this.siteSelected.emit(site);
    
    // Auto-expand parent nodes
    if (site.type === 'parent') {
      if (this.expandedNodes.has(site.id)) {
        this.expandedNodes.delete(site.id);
      } else {
        this.expandedNodes.add(site.id);
      }
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
}