import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PeripheralsComponent } from '../../components/peripherals/peripherals.component';
import { ConnectionsComponent } from '../../components/connections/connections.component';
import { SoftwaresComponent } from '../../components/softwares/softwares.component';

@Component({
    selector: 'app-add-device',
    standalone: true,
    imports: [
        RouterOutlet,
        PeripheralsComponent,
        ConnectionsComponent,
        SoftwaresComponent
    ],
    templateUrl: './add-device.component.html',
    styleUrl: './add-device.component.scss'
})
export class AddDeviceComponent implements OnInit {
    selected: any;

    ngOnInit(): void {
        this.selected = localStorage.getItem('device');
        localStorage.removeItem('device');
    }

    backButton() {
        const toAddBatch = document.getElementById('add-batch') as HTMLAnchorElement;
        toAddBatch.click();
    }
}
