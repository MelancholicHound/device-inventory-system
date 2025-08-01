import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { BatchList } from './pages/batch-list/batch-list';
import { Inventory } from './pages/inventory/inventory';
import { SupplierList } from './pages/supplier-list/supplier-list';
import { Audit } from './pages/audit/audit';
import { BatchDetails } from './pages/batch-details/batch-details';

export const routes: Routes = [
  { path: 'dashboard', component: Dashboard },
  { path: 'batch-list',
    component: BatchList,
    children: [
      {
        path: 'batch-details',
        component: BatchDetails
      }
    ]
  },
  { path: 'computer-inventory', component: Inventory },
  { path: 'supplier', component: SupplierList },
  { path: 'audit-trail', component: Audit }
];
