import { Component, OnInit, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { FormsModule, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';

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
export class AddDeviceComponent implements OnInit, DoCheck {
    batchDetails: any; deviceCount: any; selected: any;
    connections: any[] = []; peripherals: any;
    isChecked!: boolean;

    fetchedBatchId!: any; fetchedBatchNumber!: any; fetchedCount!: any;

    deviceForm!: FormGroup;

    device = localStorage.getItem('device');
    deviceDetails = JSON.stringify(this.device);

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

    }

    ngDoCheck(): void {

    }

    deviceFormGroup(formObject: any): FormGroup {
        const formGroup = new FormGroup({});

        Object.keys(formObject).forEach(key => {
            const value = formObject[key];

            if (Array.isArray(value)) {
                const formArray = new FormArray(
                    value.map(item => {
                        if (typeof item === 'object') {
                            return this.createFormGroup(item);
                        }
                        return new FormControl(item);
                    })
                );
                formGroup.addControl(key, formArray);
            } else if (typeof value === 'object' && value !== null) {
                formGroup.addControl(key, this.createFormGroup(value));
            } else {
                formGroup.addControl(key, new FormControl(value));
            }
        });

        return formGroup;
    }

    createFormGroup(object: any): FormGroup {
        const group = new FormGroup({});

        Object.keys(object).forEach(key => {
            const value = object[key];

            if (Array.isArray(value)) {
                group.addControl(key, new FormArray(value.map(item => new FormControl(item))));
            } else if (typeof value === 'object' && value !== null) {
                group.addControl(key, this.createFormGroup(value));
            } else {
                group.addControl(key, new FormControl(value));
            }
        });

        return group;
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

    onUPSBrandIdSubmit(id: number): void {

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
