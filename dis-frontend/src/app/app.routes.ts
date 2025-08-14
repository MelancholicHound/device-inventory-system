import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { BatchList } from './pages/batch-list/batch-list';
import { Inventory } from './pages/inventory/inventory';
import { SupplierList } from './pages/supplier-list/supplier-list';
import { Audit } from './pages/audit/audit';
import { BatchDetails } from './pages/batch-details/batch-details';

import { DeviceAio } from './layout/devices/aio/aio';
import { DeviceComputer } from './layout/devices/computer/computer';
import { DeviceLaptop } from './layout/devices/laptop/laptop';
import { DevicePrinter } from './layout/devices/printer/printer';
import { DeviceRouter } from './layout/devices/router/router';
import { DeviceScanner } from './layout/devices/scanner/scanner';
import { DeviceTablet } from './layout/devices/tablet/tablet';
import { Ups } from './layout/devices/ups/ups';

export const routes: Routes = [
  { path: 'dashboard', component: Dashboard },
  { path: 'batch-list', component: BatchList },
  { path: 'batch-list/batch-details', component: BatchDetails },
  { path: 'batch-list/batch-details/device/aio', component: DeviceAio },
  { path: 'batch-list/batch-details/device/computer', component: DeviceComputer },
  { path: 'batch-list/batch-details/device/laptop', component: DeviceLaptop },
  { path: 'batch-list/batch-details/device/printer', component: DevicePrinter },
  { path: 'batch-list/batch-details/device/router', component: DeviceRouter },
  { path: 'batch-list/batch-details/device/scanner', component: DeviceScanner },
  { path: 'batch-list/batch-details/device/tablet', component: DeviceTablet },
  { path: 'batch-list/batch-details/device/ups', component: Ups },
  { path: 'computer-inventory', component: Inventory },
  { path: 'computer-inventory/device/aio', component: DeviceAio },
  { path: 'computer-inventory/device/computer', component: DeviceComputer },
  { path: 'computer-inventory/device/laptop', component: DeviceLaptop },
  { path: 'computer-inventory/device/printer', component: DevicePrinter },
  { path: 'computer-inventory/device/router', component: DeviceRouter },
  { path: 'computer-inventory/device/scanner', component: DeviceScanner },
  { path: 'computer-inventory/device/tablet', component: DeviceTablet },
  { path: 'computer-inventory/device/ups', component: Ups },
  { path: 'supplier', component: SupplierList },
  { path: 'audit-trail', component: Audit }
];
