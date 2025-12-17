import { Injectable, signal } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Site, CreateSiteRequest, Polygon, CreatePolygonRequest } from '../models/site.model';

@Injectable({
  providedIn: 'root'
})
export class SiteService {
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
    this.loadSitesFromStorage();
  }

  getSites(): Observable<Site[]> {
    return this.sites$;
  }

  getSiteById(id: string): Observable<Site | undefined> {
    const site = this.findSiteById(this.sitesSubject.value, id);
    return of(site);
  }

  createSite(request: CreateSiteRequest): Observable<Site> {
    const newSite: Site = {
      id: this.generateId(),
      nameEn: request.nameEn,
      nameAr: request.nameAr,
      path: this.generatePath(request.parentId, request.nameEn),
      type: request.isLeaf ? 'leaf' : 'parent',
      parentId: request.parentId,
      children: request.isLeaf ? undefined : [],
      pricePerHour: request.pricePerHour,
      integrationCode: request.integrationCode,
      numberOfSlots: request.numberOfSlots
    };

    const sites = [...this.sitesSubject.value];
    if (request.parentId) {
      this.addChildToParent(sites, request.parentId, newSite);
    } else {
      sites.push(newSite);
    }

    this.updateSitesData(sites);
    return of(newSite);
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
      site.polygon = polygon;
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

  private loadSitesFromStorage(): void {
    try {
      const storedSites = localStorage.getItem(this.STORAGE_KEY);
      if (storedSites) {
        const sites = JSON.parse(storedSites);
        this.sitesSubject.next(sites);
      } else {
        // First time loading, use mock data and save it
        this.sitesSubject.next(this.mockSites);
        this.saveSitesToStorage(this.mockSites);
      }
    } catch (error) {
      console.error('Error loading sites from storage:', error);
      // Fallback to mock data
      this.sitesSubject.next(this.mockSites);
      this.saveSitesToStorage(this.mockSites);
    }
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