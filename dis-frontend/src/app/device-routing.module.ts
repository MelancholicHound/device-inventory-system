import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { DeviceComponent } from "./pages/device/device.component";
import { AioComponent } from "./children/aio/aio.component";
import { ComputerComponent } from "./children/computer/computer.component";
import { LaptopComponent } from "./children/laptop/laptop.component";
import { PrinterComponent } from "./children/printer/printer.component";
import { RouterComponent } from "./children/router/router.component";
import { ScannerComponent } from "./children/scanner/scanner.component";
import { TabletComponent } from "./children/tablet/tablet.component";

const routes: Routes = [
    {
        path : 'device' ,
        component : DeviceComponent ,
        children : [
            { path : 'aio' , component : AioComponent } ,
            { path : 'computer' , component : ComputerComponent } ,
            { path : 'laptop' , component : LaptopComponent } ,
            { path : 'printer' , component : PrinterComponent } ,
            { path : 'router' , component : RouterComponent } ,
            { path : 'scanner' , component : ScannerComponent } ,
            { path : 'tablet' , component : TabletComponent }
        ]
    }
];

@NgModule({
    imports : [RouterModule.forChild(routes)],
    exports : [RouterModule]
})

export class DeviceRoutingModule { }
