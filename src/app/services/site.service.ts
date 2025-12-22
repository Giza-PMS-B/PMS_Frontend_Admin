import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, map, tap, catchError } from 'rxjs';
import { Site, CreateSiteRequest, Polygon, CreatePolygonRequest } from '../models/site.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SiteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Site`;

  private sitesSubject = new BehaviorSubject<Site[]>([]);
  public sites$ = this.sitesSubject.asObservable();

  private selectedSiteSubject = new BehaviorSubject<Site | null>(null);
  public selectedSite$ = this.selectedSiteSubject.asObservable();

  private readonly STORAGE_KEY = 'pms_sites_data';

  // Mock data for development
  private mockSites: Site[] = [
    {
      id: '1',
      nameEn: 'Main Parking',
      nameAr: 'موقف رئيسي',
      path: '/main-parking',
      type: 'parent',
      children: [
        {
          id: '2',
          nameEn: 'Zone A',
          nameAr: 'المنطقة أ',
          path: '/main-parking/zone-a',
          type: 'parent',
          parentId: '1',
          children: [
            {
              id: '3',
              nameEn: 'A-01',
              nameAr: 'أ-01',
              path: '/main-parking/zone-a/a-01',
              type: 'leaf',
              parentId: '2',
              pricePerHour: 5.50,
              integrationCode: 'MAIN_A01',
              numberOfSlots: 25
            }
          ]
        }
      ]
    }
  ];

  constructor() {
    this.loadRootSites();
  }

  /**
   * Get all root sites from the backend
   */
  getSites(): Observable<Site[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roots`).pipe(
      map(sites => this.mapSiteResponseToSite(sites)),
      tap(sites => this.sitesSubject.next(sites)),
      catchError(error => {
        console.error('Error fetching sites:', error);
        return of([]);
      })
    );
  }

  /**
   * Get all leaf sites
   */
  getLeafSites(): Observable<Site[]> {
    return this.http.get<any[]>(`${this.apiUrl}/leaves`).pipe(
      map(sites => this.mapSiteResponseToSite(sites)),
      catchError(error => {
        console.error('Error fetching leaf sites:', error);
        return of([]);
      })
    );
  }

  /**
   * Get children of a specific parent site
   */
  getChildSites(parentId: string): Observable<Site[]> {
    return this.http.get<any[]>(`${this.apiUrl}/children/${parentId}`).pipe(
      map(sites => this.mapSiteResponseToSite(sites)),
      catchError(error => {
        console.error('Error fetching child sites:', error);
        return of([]);
      })
    );
  }

  getSiteById(id: string): Observable<Site | undefined> {
    const site = this.findSiteById(this.sitesSubject.value, id);
    return of(site);
  }

  /**
   * Create a new site (parent or leaf)
   */
  createSite(request: CreateSiteRequest): Observable<Site> {
    const path = this.generatePath(request.parentId, request.nameEn);

    if (request.isLeaf) {
      const leafDto = {
        path: path,
        nameEn: request.nameEn,
        nameAr: request.nameAr,
        parentId: request.parentId || null,
        pricePerHour: request.pricePerHour || 0,
        integrationCode: request.integrationCode || '',
        numberOfSolts: request.numberOfSlots || 0,
        polygons: request.polygons || []
      };

      return this.http.post<any>(`${this.apiUrl}/add/leaf`, leafDto).pipe(
        map(response => this.mapSingleSiteResponse(response.data || response)),
        tap(site => {
          this.fetchCompleteTree();
        }),
        catchError(error => {
          console.error('Error creating leaf site:', error);
          throw error;
        })
      );
    } else {
      const parentDto = {
        path: path,
        nameEn: request.nameEn,
        nameAr: request.nameAr,
        parentId: request.parentId || null
      };

      return this.http.post<any>(`${this.apiUrl}/add/parent`, parentDto).pipe(
        map(response => this.mapSingleSiteResponse(response.data || response)),
        tap(site => {
          this.fetchCompleteTree();
        }),
        catchError(error => {
          console.error('Error creating parent site:', error);
          throw error;
        })
      );
    }
  }

  updateSite(id: string, updates: Partial<Site>): Observable<Site> {
    const sites = [...this.sitesSubject.value];
    const site = this.findSiteById(sites, id);
    
    if (site) {
      Object.assign(site, updates);
      this.updateSitesData(sites);
      return of(site);
    }
    
    throw new Error('Site not found');
  }

  createPolygon(request: CreatePolygonRequest): Observable<Polygon> {
    console.log('Creating polygon for siteId:', request.siteId);
    
    const polygon: Polygon = {
      id: this.generateId(),
      name: request.name,
      coordinates: request.coordinates,
      siteId: request.siteId
    };

    const sites = [...this.sitesSubject.value];
    const site = this.findSiteById(sites, request.siteId);
    
    console.log('Found site:', site);
    
    if (site) {
      // Initialize polygons array if it doesn't exist
      if (!site.polygons) {
        site.polygons = [];
      }
      // Add the new polygon to the array
      site.polygons.push(polygon);
      this.updateSitesData(sites);
      console.log('Polygon attached to site successfully');
    } else {
      console.error('Site not found with ID:', request.siteId);
    }

    return of(polygon);
  }

  selectSite(site: Site | null): void {
    this.selectedSiteSubject.next(site);
  }

  private findSiteById(sites: Site[], id: string): Site | undefined {
    for (const site of sites) {
      if (site.id === id) {
        return site;
      }
      if (site.children) {
        const found = this.findSiteById(site.children, id);
        if (found) return found;
      }
    }
    return undefined;
  }

  private addChildToParent(sites: Site[], parentId: string, child: Site): void {
    const parent = this.findSiteById(sites, parentId);
    if (parent && parent.children) {
      parent.children.push(child);
    }
  }

  private generatePath(parentId?: string, name?: string): string {
    if (!parentId) {
      return `/${this.slugify(name || '')}`;
    }
    
    const parent = this.findSiteById(this.sitesSubject.value, parentId);
    const slug = this.slugify(name || '');
    return parent ? `${parent.path}/${slug}` : `/${slug}`;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Load root sites from the backend on initialization
   */
  private loadRootSites(): void {
    this.fetchCompleteTree();
  }

  /**
   * Map backend site response to frontend Site model
   */
  private mapSiteResponseToSite(sites: any[]): Site[] {
    return sites.map(site => this.mapSingleSiteResponse(site));
  }

  /**
   * Map single backend site response to frontend Site model
   */
  private mapSingleSiteResponse(siteDto: any): Site {
    return {
      id: siteDto.id,
      nameEn: siteDto.nameEn,
      nameAr: siteDto.nameAr,
      path: siteDto.path,
      type: siteDto.isLeaf ? 'leaf' : 'parent',
      parentId: siteDto.parentId,
      children: siteDto.isLeaf ? undefined : [],
      pricePerHour: siteDto.pricePerHour,
      integrationCode: siteDto.integrationCode,
      numberOfSlots: siteDto.numberOfSolts,
      polygons: siteDto.polygons ? this.mapPolygonResponse(siteDto.polygons) : []
    };
  }

  /**
   * Fetch and build complete site tree with all children
   */
  fetchCompleteTree(): void {
    this.http.get<any[]>(`${this.apiUrl}/roots`).pipe(
      map(sites => this.mapSiteResponseToSite(sites))
    ).subscribe({
      next: (rootSites) => {
        // For each root site, fetch its children recursively
        const loadPromises = rootSites.map(site => this.fetchChildrenRecursive(site));
        Promise.all(loadPromises).then(sitesWithChildren => {
          this.sitesSubject.next(sitesWithChildren);
        });
      },
      error: (error) => {
        console.error('Error fetching complete tree:', error);
      }
    });
  }

  /**
   * Recursively fetch children for a site
   */
  private fetchChildrenRecursive(site: Site): Promise<Site> {
    if (site.type === 'leaf') {
      return Promise.resolve(site);
    }

    return this.http.get<any[]>(`${this.apiUrl}/children/${site.id}`).pipe(
      map(children => this.mapSiteResponseToSite(children))
    ).toPromise().then(children => {
      if (children && children.length > 0) {
        return Promise.all(children.map(child => this.fetchChildrenRecursive(child)))
          .then(childrenWithGrandchildren => {
            site.children = childrenWithGrandchildren;
            return site;
          });
      } else {
        site.children = [];
        return site;
      }
    }).catch(error => {
      console.error(`Error fetching children for site ${site.id}:`, error);
      site.children = [];
      return site;
    });
  }

  /**
   * Map backend polygon response to frontend Polygon model
   */
  private mapPolygonResponse(polygons: any[]): Polygon[] {
    return polygons.map(polygon => ({
      id: polygon.id,
      name: polygon.name,
      siteId: polygon.siteId,
      coordinates: polygon.polygonPoints?.map((point: any) => ({
        latitude: point.latitude,
        longitude: point.longitude
      })) || []
    }));
  }

  private updateSitesData(sites: Site[]): void {
    this.sitesSubject.next(sites);
    this.saveSitesToStorage(sites);
  }

  private saveSitesToStorage(sites: Site[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sites));
    } catch (error) {
      console.error('Error saving sites to storage:', error);
    }
  }

  // Method to reset data (useful for development/testing)
  resetToMockData(): void {
    this.updateSitesData(this.mockSites);
  }

  // Method to clear all data
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.sitesSubject.next([]);
  }
}