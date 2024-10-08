import { Routes } from '@angular/router';

import { AddBatchComponent } from './pages/add-batch/add-batch.component';
import { AddDeviceComponent } from './pages/add-device/add-device.component';
import { BatchDeliveryComponent } from './pages/batch-delivery/batch-delivery.component';
import { ComputerInventoryComponent } from './pages/computer-inventory/computer-inventory.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';

import { AioComponent } from './devices/aio/aio.component';
import { ComputerComponent } from './devices/computer/computer.component';
import { LaptopComponent } from './devices/laptop/laptop.component';
import { PrinterComponent } from './devices/printer/printer.component';
import { RouterComponent } from './devices/router/router.component';
import { ScannerComponent } from './devices/scanner/scanner.component';
import { ServerComponent } from './devices/server/server.component';
import { TabletComponent } from './devices/tablet/tablet.component';

export const routes: Routes = [
    { path: 'add-batch' , component: AddBatchComponent, data: { reuse: true } },
    { path: 'add-device' , component: AddDeviceComponent,
      children: [
         { path: 'aio' , component: AioComponent },
         { path: 'computer' , component: ComputerComponent },
         { path: 'laptop' , component: LaptopComponent },
         { path: 'printer' , component: PrinterComponent },
         { path: 'router' , component: RouterComponent },
         { path: 'scanner' , component: ScannerComponent },
         { path: 'server' , component: ServerComponent },
         { path: 'tablet' , component: TabletComponent }
      ]
    },
    { path: 'batch-delivery' , component: BatchDeliveryComponent },
    { path: 'computer-inventory' , component: ComputerInventoryComponent },
    { path: 'user-profile', component: UserProfileComponent }
];
