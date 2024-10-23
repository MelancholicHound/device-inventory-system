import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

import { PeripheralsComponent } from '../../components/peripherals/peripherals.component';
import { ConnectionsComponent } from '../../components/connections/connections.component';
import { SoftwaresComponent } from '../../components/softwares/softwares.component';

import { AuthService } from '../../util/services/auth.service';

@Component({
    selector: 'app-add-device',
    standalone: true,
    imports: [
        RouterOutlet,
        PeripheralsComponent,
        ConnectionsComponent,
        SoftwaresComponent
    ],
    providers: [
        AuthService
    ],
    templateUrl: './add-device.component.html',
    styleUrl: './add-device.component.scss'
})
export class AddDeviceComponent implements OnInit {
    batchDetails: any; deviceCount: any; selected: any;
    connections: any[] = []; peripherals: any;
    deviceDetails: any;

    constructor(private router: Router,
                private auth: AuthService) {
                const navigation = this.router.getCurrentNavigation();
                if (navigation?.extras.state) {
                    this.selected = navigation.extras.state['device'];
                }
    }

    ngOnInit(): void {
        this.auth.deviceDetails.subscribe({
            next: (data: any) => this.deviceDetails = data,
            error: (error: any) => console.log(error)
        });

        setInterval(() => {
            if (this.deviceDetails) {

            }
        }, 2000);
    }

    onConnectionChanges(checkedIds: number[]): void {
        this.connections = checkedIds;
    }

    backButton() { this.router.navigate(['add-batch']) }
}
