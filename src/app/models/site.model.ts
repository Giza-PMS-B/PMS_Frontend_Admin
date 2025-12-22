export interface Site {
  id: string;
  nameEn: string;
  nameAr: string;
  path: string;
  type: 'parent' | 'leaf';
  parentId?: string;
  children?: Site[];
  
  // Leaf-specific properties
  pricePerHour?: number;
  integrationCode?: string;
  numberOfSlots?: number;
  polygons?: Polygon[];
}

export interface Polygon {
  id: string;
  name: string;
  coordinates: Coordinate[];
  siteId: string;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface CreateSiteRequest {
  nameEn: string;
  nameAr: string;
  parentId?: string;
  isLeaf: boolean;

  // Leaf-specific fields
  pricePerHour?: number;
  integrationCode?: string;
  numberOfSlots?: number;
  polygons?: CreatePolygonDTO[];
}

export interface CreatePolygonDTO {
  name: string;
  points: CreatePolygonPointDTO[];
}

export interface CreatePolygonPointDTO {
  latitude: number;
  longitude: number;
}

export interface CreatePolygonRequest {
  name: string;
  coordinates: Coordinate[];
  siteId: string;
}