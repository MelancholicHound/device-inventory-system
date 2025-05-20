import { Routes } from '@angular/router';

import { BatchListComponent } from './pages/batch-list/batch-list.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { BatchDetailsComponent } from './pages/batch-details/batch-details.component';

export const routes: Routes = [
    {
        path : 'batch-list' ,
        component : BatchListComponent ,
        children : [
            {
                path : 'batch-details' ,
                component : BatchDetailsComponent ,
                loadChildren : () => import('./device-routing.module').then(m => m.DeviceRoutingModule)
            }
        ]
    },
    { path : 'device-inventory' , component : InventoryComponent }
];
