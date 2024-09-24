import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

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
    selected: any; deviceCount: any;

    constructor(private router: Router) { }

    ngOnInit(): void {
        this.deviceCount = localStorage.getItem('devicecount');
        this.selected = localStorage.getItem('device');
        localStorage.removeItem('device');
        localStorage.removeItem('devicecount');
    }

    backButton() {
        this.router.navigate(['/add-batch'], { queryParams: { ref: new Date().getTime() } });
    }
}
