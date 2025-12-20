import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AddSiteComponent } from './components/add-site/add-site.component';
import { PolygonFormComponent } from './components/polygon-form/polygon-form.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'admin/add-site', component: AddSiteComponent },
  { path: 'admin/polygon', component: PolygonFormComponent },
  { path: '**', redirectTo: '/' }
];
