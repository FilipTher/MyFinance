import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { History } from './pages/history/history';
import { Goals } from './pages/goals/goals';
import { Analytics } from './pages/analytics/analytics';
import { ImportExport } from './pages/import-export/import-export';
import { Profile } from './pages/profile/profile';
import { Settings } from './pages/settings/settings';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
  { path: 'dashboard', component: Dashboard },
  { path: 'history', component: History },
  { path: 'goals', component: Goals },
  { path: 'analytics', component: Analytics },
  { path: 'profile', component: Profile },
  { path: 'import-export', component: ImportExport },
  { path: 'settings', component: Settings }
];