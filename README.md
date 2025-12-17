# Parking Management System - Admin Portal

A professional Angular-based admin portal for managing parking sites and hierarchies. This application provides a comprehensive interface for administrators to manage parking areas, define geographical boundaries, and configure parking slots.

## Features

### 🏢 Site Management
- **Hierarchical Site Structure**: Create parent and leaf parking sites with tree-like organization
- **Dual Language Support**: English and Arabic names for all sites
- **Auto-generated Paths**: Automatic URL path generation based on site hierarchy
- **Site Types**: Support for both parent sites (containers) and leaf sites (actual parking areas)

### 📍 Polygon Management
- **Geographical Boundaries**: Define parking area boundaries using coordinate points
- **Interactive Map Interface**: Click-to-add coordinate points (mock implementation)
- **Coordinate Validation**: Latitude/longitude validation with proper ranges
- **Minimum Point Requirements**: Enforce minimum 3 points for valid polygons

### 💰 Leaf Site Configuration
- **Pricing Management**: Set hourly rates for parking areas
- **Integration Codes**: Unique codes for external system integration
- **Slot Configuration**: Define number of available parking slots

### 🎨 Professional UI/UX
- **Modern Design**: Clean, professional interface with responsive design
- **Tree Navigation**: Intuitive hierarchical site navigation
- **Form Validation**: Comprehensive client-side validation with error messages
- **Success/Error Feedback**: User-friendly notification system
- **Mobile Responsive**: Optimized for desktop and mobile devices

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── admin-dashboard/          # Main dashboard with site tree and details
│   │   ├── add-site/                 # Add/Edit site form
│   │   ├── polygon-form/             # Polygon creation and editing
│   │   ├── site-details/             # Site information display
│   │   └── site-tree/                # Hierarchical site navigation
│   ├── models/
│   │   └── site.model.ts             # TypeScript interfaces and models
│   ├── services/
│   │   └── site.service.ts           # Site management service with mock data
│   └── assets/
│       └── styles/
│           └── styles.scss           # Global styles and utilities
```

## Screen Implementations

### 1. Admin Dashboard (Screen 1)
- **Location**: `/admin`
- **Features**: Site tree navigation, site details panel, add site button
- **Components**: `AdminDashboardComponent`, `SiteTreeComponent`, `SiteDetailsComponent`

### 2. Add Parent Site (Screen 2)
- **Location**: `/admin/add-site`
- **Features**: Parent site creation with auto-generated paths
- **Validation**: Required EN/AR names, unique validation, length constraints

### 3. Add Leaf Site (Screen 3)
- **Location**: `/admin/add-site?parentId=xxx`
- **Features**: Leaf site creation with pricing and slot configuration
- **Requirements**: Polygon must be added before saving

### 4. Polygon Management (Screen 4)
- **Location**: `/admin/polygon?siteId=xxx`
- **Features**: Interactive coordinate management, map visualization
- **Validation**: Minimum 3 points, lat/lng range validation

### 5. Edit Site (Screen 5)
- **Location**: `/admin/add-site?siteId=xxx&mode=edit`
- **Features**: Edit existing sites, polygon management for leaf sites

## Technical Implementation

### Framework & Tools
- **Angular 21**: Latest Angular framework with standalone components
- **TypeScript**: Strongly typed development
- **SCSS**: Advanced styling with variables and mixins
- **Reactive Forms**: Form validation and management
- **RxJS**: Reactive programming for data management
- **Angular Router**: Navigation and routing

### Key Features
- **Standalone Components**: Modern Angular architecture
- **Signal-based State**: Angular signals for reactive state management
- **Responsive Design**: Mobile-first responsive layout
- **Form Validation**: Comprehensive client-side validation
- **Mock Data Service**: Development-ready mock data implementation
- **Professional Styling**: Clean, modern UI with consistent design system

## Development Server

To start the development server:

```bash
cd PMS_Frontend_Admin
npm install
ng serve
```

Navigate to `http://localhost:4200/` to view the application.

## Build

To build the project for production:

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Validation Rules

### Site Names (EN/AR)
- Required fields
- Minimum length: 3 characters
- Maximum length: 100 characters
- Must be unique within the system

### Leaf Site Fields
- **Price per Hour**: Required, numeric, up to 2 decimal places
- **Integration Code**: Required, unique, 3-100 characters, letters/numbers/hyphens/underscores/spaces
- **Number of Slots**: Required, numeric, range 1-10,000

### Polygon Coordinates
- **Latitude**: Required, decimal, range -90 to +90, up to 6 decimal places
- **Longitude**: Required, decimal, range -180 to +180, up to 6 decimal places
- **Minimum Points**: At least 3 coordinate points required

## Future Enhancements

- **Real Map Integration**: Replace mock map with Google Maps or Leaflet
- **Backend Integration**: Connect to actual REST API
- **User Authentication**: Add login and role-based access
- **Advanced Search**: Site search and filtering capabilities
- **Bulk Operations**: Import/export functionality
- **Audit Trail**: Track changes and user actions
- **Real-time Updates**: WebSocket integration for live updates

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of a parking management system implementation.