import { Component, OnInit, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';

import { PeripheralsComponent } from '../../components/peripherals/peripherals.component';
import { ConnectionsComponent } from '../../components/connections/connections.component';
import { SoftwaresComponent } from '../../components/softwares/softwares.component';

import { AuthService } from '../../util/services/auth.service';

@Component({
    selector: 'app-add-device',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
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
    deviceDetails: any; isChecked!: boolean;

    fetchedBatchId!: any; fetchedBatchNumber!: any; fetchedCount!: any;

    isPeripheralToggled: boolean = true;
    isConnectionToggled: boolean = true;
    isSoftwareToggled: boolean = true;

    constructor(private router: Router,
                private auth: AuthService) {
                const navigation = this.router.getCurrentNavigation();
                if (navigation?.extras.state) {
                    this.selected = navigation.extras.state['device'];
                    this.batchDetails = navigation.extras.state['batchdetails'];
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
        }, 200);
    }

    onTogglePeripherals() {
        this.isPeripheralToggled = !this.isPeripheralToggled;
    }

    onToggleConnections() {
        this.isConnectionToggled = !this.isConnectionToggled;
    }

    onToggleSoftwares() {
        this.isSoftwareToggled = !this.isSoftwareToggled;
    }

    onPeripheralsChanges(peripheralsIds: number[]): void {
        this.peripherals = peripheralsIds;
    }

    onConnectionChanges(connectionsIds: number[]): void {
        this.connections = connectionsIds;
    }

    backButton() {
        this.router.navigate(['add-batch'], {
          state: { batchdetails: this.batchDetails }
      });
    }
}
