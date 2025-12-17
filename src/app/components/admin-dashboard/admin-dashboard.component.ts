import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SiteService } from '../../services/site.service';
import { Site } from '../../models/site.model';
import { SiteTreeComponent } from '../site-tree/site-tree.component';
import { SiteDetailsComponent } from '../site-details/site-details.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SiteTreeComponent, SiteDetailsComponent],
  template: `
    <div class="admin-dashboard">
      <header class="dashboard-header">
        <h1>Admin Portal</h1>
        <button class="add-site-btn" (click)="onAddSite()">
          <span class="plus-icon">+</span>
          Add Site
        </button>
      </header>

      <div class="dashboard-content">
        <div class="left-panel">
          <h3>Sites Tree</h3>
          <app-site-tree 
            [sites]="sites()"
            (siteSelected)="onSiteSelected($event)"
            (addChild)="onAddChild($event)">
          </app-site-tree>
        </div>

        <div class="right-panel">
          <h3>Details</h3>
          <app-site-details 
            [selectedSite]="selectedSite()"
            (editSite)="onEditSite($event)"
            (editPolygon)="onEditPolygon($event)">
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

  onEditSite(site: Site): void {
    this.router.navigate(['/admin/add-site'], { 
      queryParams: { siteId: site.id, mode: 'edit' } 
    });
  }

  onEditPolygon(site: Site): void {
    this.router.navigate(['/admin/polygon'], { 
      queryParams: { siteId: site.id } 
    });
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