import { Component } from '@angular/core';
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
export class AddDeviceComponent {
    batchDetails: any; deviceCount: any; selected: any;
    connections: any[] = []; peripherals: any;

    constructor(private router: Router) {
                const navigation = this.router.getCurrentNavigation();
                if (navigation?.extras.state) {
                    this.selected = navigation.extras.state['device'];
                }
     }

    onConnectionChanges(checkedIds: number[]): void {
        this.connections = checkedIds;
    }

    backButton() { this.router.navigate(['add-batch']) }
}
