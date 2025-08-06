import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { BatchList } from './pages/batch-list/batch-list';
import { Inventory } from './pages/inventory/inventory';
import { SupplierList } from './pages/supplier-list/supplier-list';
import { Audit } from './pages/audit/audit';
import { BatchDetails } from './pages/batch-details/batch-details';

import { Aio } from './layout/devices/aio/aio';
import { Computer } from './layout/devices/computer/computer';
import { Laptop } from './layout/devices/laptop/laptop';
import { Printer } from './layout/devices/printer/printer';
import { Router } from './layout/devices/router/router';
import { Scanner } from './layout/devices/scanner/scanner';
import { Tablet } from './layout/devices/tablet/tablet';
import { Ups } from './layout/devices/ups/ups';

export const routes: Routes = [
  { path: 'dashboard', component: Dashboard },
  { path: 'batch-list', component: BatchList },
  { path: 'batch-list/batch-details', component: BatchDetails },
  { path: 'batch-list/batch-details/device/aio', component: Aio },
  { path: 'batch-list/batch-details/device/computer', component: Computer },
  { path: 'batch-list/batch-details/device/laptop', component: Laptop },
  { path: 'batch-list/batch-details/device/printer', component: Printer },
  { path: 'batch-list/batch-details/device/router', component: Router },
  { path: 'batch-list/batch-details/device/scanner', component: Scanner },
  { path: 'batch-list/batch-details/device/tablet', component: Tablet },
  { path: 'batch-list/batch-details/device/ups', component: Ups },
  { path: 'computer-inventory', component: Inventory },
  { path: 'computer-inventory/device/aio', component: Aio },
  { path: 'computer-inventory/device/computer', component: Computer },
  { path: 'computer-inventory/device/laptop', component: Laptop },
  { path: 'computer-inventory/device/printer', component: Printer },
  { path: 'computer-inventory/device/router', component: Router },
  { path: 'computer-inventory/device/scanner', component: Scanner },
  { path: 'computer-inventory/device/tablet', component: Tablet },
  { path: 'computer-inventory/device/ups', component: Ups },
  { path: 'supplier', component: SupplierList },
  { path: 'audit-trail', component: Audit }
];
