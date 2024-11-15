import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { FormsModule, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';

import { Store } from '@ngrx/store';

import { filter, map } from 'rxjs/operators';

import { PeripheralsComponent } from '../../components/peripherals/peripherals.component';
import { ConnectionsComponent } from '../../components/connections/connections.component';
import { SoftwaresComponent } from '../../components/softwares/softwares.component';

import { AuthService } from '../../util/services/auth.service';
import { DeviceAioService } from '../../util/services/device-aio.service';
import { DeviceComputerService } from '../../util/services/device-computer.service';
import { DeviceLaptopService } from '../../util/services/device-laptop.service';
import { DevicePrinterService } from '../../util/services/device-printer.service';
import { DeviceRouterService } from '../../util/services/device-router.service';
import { DeviceScannerService } from '../../util/services/device-scanner.service';
import { DeviceServerService } from '../../util/services/device-server.service';
import { DeviceTabletService } from '../../util/services/device-tablet.service';

import { AppState } from '../../util/store/app.reducer';

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
        AuthService,
        DeviceAioService,
        DeviceComputerService,
        DeviceLaptopService,
        DevicePrinterService,
        DeviceRouterService,
        DeviceScannerService,
        DeviceServerService,
        DeviceTabletService
    ],
    templateUrl: './add-device.component.html',
    styleUrl: './add-device.component.scss'
})
export class AddDeviceComponent implements OnInit {
    batchDetails: any; selected: any;
    isChecked!: boolean;
    deviceDetails: { [key: string]: any } = {};

    fetchedBatchId!: any; fetchedBatchNumber!: any; fetchedCount!: any;

    deviceForm!: FormGroup;

    device = localStorage.getItem('device');

    isPeripheralToggled: boolean = true;
    isConnectionToggled: boolean = true;
    isSoftwareToggled: boolean = true;

    constructor(private router: Router,
                private auth: AuthService,
                private store: Store<{ app: AppState }>,
                private aioAuth: DeviceAioService,
                private computerAuth: DeviceComputerService,
                private laptopAuth: DeviceLaptopService,
                private printerAuth: DevicePrinterService,
                private routerAuth: DeviceRouterService,
                private scannerAuth: DeviceScannerService,
                private serverAuth: DeviceServerService,
                private tabletAuth: DeviceTabletService) {
                const navigation = this.router.getCurrentNavigation();
                if (navigation?.extras.state) {
                    this.selected = navigation.extras.state['device'];
                    this.fetchedCount = navigation.extras.state['count'];
                    this.batchDetails = navigation.extras.state['batchdetails'];
                }
    }

    ngOnInit(): void {
        this.deviceForm = this.createDeviceFormGroup();

        this.store.select('app').pipe(
            map(state => state.childData),
            filter(updateChildData => Object.keys(updateChildData).length > 0)
        ).subscribe((updateChildData) => {
            this.deviceFormGroup(updateChildData['data']);
            for (let i = 1; i <= this.fetchedCount; i++) {
                if (this.selected === 'Computer') {
                    this.computerAuth.postDevice(this.deviceForm.value).subscribe({
                        next: () => this.backButton(),
                        error: (error: any) => console.log(error)
                    });
                } else if (this.selected === 'Laptop') {
                    this.laptopAuth.postDevice(this.deviceForm.value).subscribe({
                        next: () => this.backButton(),
                        error: (error: any) => console.log(error)
                    });
                } else if (this.selected === 'Tablet') {
                    this.tabletAuth.postDevice(this.deviceForm.value).subscribe({
                        next: () => this.backButton(),
                        error: (error: any) => console.log(error)
                    });
                } else if (this.selected === 'Printer') {
                    this.printerAuth.postDevice(this.deviceForm.value).subscribe({
                        next: () => this.backButton(),
                        error: (error: any) => console.log(error)
                    });
                } else if (this.selected === 'Router') {
                    this.routerAuth.postDevice(this.deviceForm.value).subscribe({
                        next: () => this.backButton(),
                        error: (error: any) => console.log(error)
                    });
                } else if (this.selected === 'Scanner') {
                    this.scannerAuth.postDevice(this.deviceForm.value).subscribe({
                        next: () => this.backButton(),
                        error: (error: any) => console.log(error)
                    });
                } else if (this.selected === 'AIO') {
                    this.aioAuth.postDevice(this.deviceForm.value).subscribe({
                        next: () => this.backButton(),
                        error: (error: any) => console.log('HI')
                    });
                } else if (this.selected === 'Server') {
                    this.serverAuth.postDevice(this.deviceForm.value).subscribe({
                        next: () => this.backButton(),
                        error: (error: any) => console.log(error)
                    });
                }

                if (i === this.fetchedCount) {
                    this.router.navigate(['add-batch'], {
                        state: { batchdetails: this.batchDetails }
                    });
                }
            }
        });
    }

    createDeviceFormGroup(): FormGroup {
        return new FormGroup({
            upsId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            peripheralIds: new FormArray([], [Validators.required]),
            deviceSoftwareRequest: new FormArray([], [Validators.required]),
            connectionIds: new FormArray([], [Validators.required])
        });
    }

    deviceFormGroup(formObject: any): FormGroup {
        Object.keys(formObject).forEach((key) => {
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
                this.deviceForm.addControl(key, formArray);
            } else if (typeof value === 'object' && value !== null) {
                this.deviceForm.addControl(key, this.createFormGroup(value));
            } else {
                this.deviceForm.addControl(key, new FormControl(value));
            }
        });

        return this.deviceForm;
    }

    createFormGroup(object: any): FormGroup {
        const group = new FormGroup({});

        Object.keys(object).forEach((key) => {
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

    onPeripheralsChanges(peripheralIds: number[]): void {
        let peripheralsArray = this.deviceForm.get('peripheralIds') as FormArray;

        peripheralsArray.clear();
        peripheralsArray.push(new FormControl(peripheralIds));
    }

    onConnectionChanges(connectionIds: number[]): void {
        let connectionsArray = this.deviceForm.get('connectionIds') as FormArray;

        connectionsArray.clear();
        connectionsArray.push(new FormControl(connectionIds));
    }

    onSoftwareChanges(softwareIds: any[]): void {
        let softwaresArray = this.deviceForm.get('deviceSoftwareRequest') as FormArray;

        softwaresArray.clear();
        softwaresArray.push(new FormControl(softwareIds));
    }

    onUPSBrandIdSubmit(id: number): void {
        this.deviceForm.patchValue({ upsId: id });
        console.log(this.deviceForm.value);
    }

    backButton() {
        this.router.navigate(['add-batch'], {
          state: { batchdetails: this.batchDetails }
        });
    }
}
