import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SiteService } from '../../services/site.service';
import { Site } from '../../models/site.model';
import { SiteTreeComponent } from '../site-tree/site-tree.component';
import { SiteDetailsComponent } from '../site-details/site-details.component';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, SiteTreeComponent, SiteDetailsComponent, LanguageSwitcherComponent],
  template: `
    <div class="admin-dashboard">
      <header class="dashboard-header">
        <div class="header-left">
          <img src="assets/logo5.png" alt="Logo" class="logo">
          <h1>{{ 'ADMIN.PORTAL' | translate }}</h1>
        </div>
        <div class="header-right">
          <app-language-switcher></app-language-switcher>
          <button class="add-site-btn" (click)="onAddSite()">
            <span class="plus-icon">+</span>
            {{ 'ADMIN.ADD_SITE' | translate }}
          </button>
        </div>
      </header>

      <div class="dashboard-content">
        <div class="left-panel">
          <h3>{{ 'ADMIN.SITES_TREE' | translate }}</h3>
          <app-site-tree 
            [sites]="sites()"
            [selectedSiteId]="selectedSite()?.id || null"
            [expandedNodes]="expandedNodes()"
            [highlightedParents]="highlightedParents()"
            (siteSelected)="onSiteSelected($event)"
            (addChild)="onAddChild($event)"
            (nodeToggled)="onNodeToggled($event)">
          </app-site-tree>
        </div>

        <div class="right-panel">
          <h3>{{ 'ADMIN.DETAILS' | translate }}</h3>
          <app-site-details 
            [selectedSite]="selectedSite()">
          </app-site-details>
        </div>
      </div>

      @if (showMessage()) {
        <div class="message" [class.success]="messageType() === 'success'" [class.error]="messageType() === 'error'">
          {{ message() }}
        </div>
      }
    </div>
  `,
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  sites = signal<Site[]>([]);
  selectedSite = signal<Site | null>(null);
  expandedNodes = signal<Set<string>>(new Set());
  highlightedParents = signal<Set<string>>(new Set());
  message = signal<string>('');
  messageType = signal<'success' | 'error'>('success');
  showMessage = signal<boolean>(false);

  constructor(
    private siteService: SiteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.siteService.sites$.subscribe(sites => {
      this.sites.set(sites);
    });

    this.siteService.selectedSite$.subscribe(site => {
      this.selectedSite.set(site);
      
      // Auto-expand tree to show the selected site and highlight parents
      if (site) {
        this.expandTreeToSite(site);
        this.highlightParentsOfSite(site);
      } else {
        this.highlightedParents.set(new Set());
      }
    });
  }

  onAddSite(): void {
    this.router.navigate(['/admin/add-site']);
  }

  onSiteSelected(site: Site): void {
    this.siteService.selectSite(site);
  }

  onAddChild(parentSite: Site): void {
    this.router.navigate(['/admin/add-site'], { 
      queryParams: { parentId: parentSite.id } 
    });
  }

  onNodeToggled(nodeId: string): void {
    const newExpandedNodes = new Set(this.expandedNodes());
    if (newExpandedNodes.has(nodeId)) {
      newExpandedNodes.delete(nodeId);
    } else {
      newExpandedNodes.add(nodeId);
    }
    this.expandedNodes.set(newExpandedNodes);
  }



  private expandTreeToSite(targetSite: Site): void {
    const newExpandedNodes = new Set(this.expandedNodes());
    
    // Find the path to the target site and expand all parent nodes
    const expandPath = (sites: Site[], targetId: string, currentPath: string[] = []): boolean => {
      for (const site of sites) {
        const newPath = [...currentPath, site.id];
        
        if (site.id === targetId) {
          // Found the target site, expand all parents in the path
          currentPath.forEach(parentId => {
            newExpandedNodes.add(parentId);
          });
          return true;
        }
        
        if (site.children && site.children.length > 0) {
          if (expandPath(site.children, targetId, newPath)) {
            // Target found in children, expand this node too
            newExpandedNodes.add(site.id);
            return true;
          }
        }
      }
      return false;
    };
    
    expandPath(this.sites(), targetSite.id);
    this.expandedNodes.set(newExpandedNodes);
  }

  private highlightParentsOfSite(targetSite: Site): void {
    const highlightedParents = new Set<string>();
    
    // Find the path to the target site and highlight all parent nodes
    const findParentPath = (sites: Site[], targetId: string, currentPath: string[] = []): boolean => {
      for (const site of sites) {
        const newPath = [...currentPath, site.id];
        
        if (site.id === targetId) {
          // Found the target site, highlight all parents in the path
          currentPath.forEach(parentId => {
            highlightedParents.add(parentId);
          });
          return true;
        }
        
        if (site.children && site.children.length > 0) {
          if (findParentPath(site.children, targetId, newPath)) {
            // Target found in children, highlight this parent too
            highlightedParents.add(site.id);
            return true;
          }
        }
      }
      return false;
    };
    
    findParentPath(this.sites(), targetSite.id);
    this.highlightedParents.set(highlightedParents);
  }

  private showMessageWithTimeout(msg: string, type: 'success' | 'error' = 'success'): void {
    this.message.set(msg);
    this.messageType.set(type);
    this.showMessage.set(true);
    
    setTimeout(() => {
      this.showMessage.set(false);
    }, 3000);
  }
}