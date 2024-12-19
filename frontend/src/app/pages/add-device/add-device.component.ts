import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { FormsModule, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';

import { Store } from '@ngrx/store';

import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { PeripheralsComponent } from '../../components/peripherals/peripherals.component';
import { ConnectionsComponent } from '../../components/connections/connections.component';
import { SoftwaresComponent } from '../../components/softwares/softwares.component';

import { DeviceAioService } from '../../util/services/device-aio.service';
import { DeviceComputerService } from '../../util/services/device-computer.service';
import { DeviceLaptopService } from '../../util/services/device-laptop.service';
import { DevicePrinterService } from '../../util/services/device-printer.service';
import { DeviceRouterService } from '../../util/services/device-router.service';
import { DeviceScannerService } from '../../util/services/device-scanner.service';
import { DeviceServerService } from '../../util/services/device-server.service';
import { DeviceTabletService } from '../../util/services/device-tablet.service';

import { AppState } from '../../util/store/app.reducer';
import { clearChildData, updateChildData } from '../../util/store/app.actions';

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
export class AddDeviceComponent implements OnInit, OnDestroy {
    private subscription!: Subscription;
    batchDetails: any; selected: any; deviceRequest: any;
    isChecked!: boolean; isAdding!: boolean;
    fromComputerInventory!: boolean;
    deviceDetails: { [key: string]: any } = {};

    fetchedBatchId!: any; fetchedBatchNumber!: any; fetchedCount!: any;
    connectionsPayload: any[] = []; peripheralsPayload: any[] = []; softwaresPayload: any[] = [];

    deviceForm!: FormGroup;

    device = localStorage.getItem('device');

    isPeripheralToggled: boolean = true;
    isConnectionToggled: boolean = true;
    isSoftwareToggled: boolean = true;

    constructor(private router: Router,
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
                    this.deviceRequest = navigation.extras.state['devicedetails'];
                }

                if (navigation?.extras.queryParams) {
                    this.isAdding = navigation.extras.queryParams['isAdding'];
                    this.fromComputerInventory = navigation.extras.queryParams['deviceinventory'];
                }

    }

    ngOnInit(): void {
        this.deviceForm = this.createDeviceFormGroup();

        this.subscription = this.store.select('app').pipe(
            map(state => state.childData),
            filter(updateChildData => Object.keys(updateChildData).length > 0)
        ).subscribe(updateChildData => {
            const authServices: any = {
                Computer: this.computerAuth, Laptop: this.laptopAuth,
                Tablet: this.tabletAuth, Printer: this.printerAuth,
                Router: this.routerAuth, Scanner: this.scannerAuth,
                AIO: this.aioAuth, Server: this.serverAuth
            };

            const removableControls: any = {
                Tablet: ['deviceSoftwareRequest'],
                Printer: ['connectionIds', 'deviceSoftwareRequest'],
                Router: ['connectionIds', 'deviceSoftwareRequest'],
                Scanner: ['connectionIds', 'deviceSoftwareRequest'],
                Server: ['peripheralIds', 'connectionIds', 'deviceSoftwareRequest']
            };

            if (this.selected in authServices) {
                let currentAuth = authServices[this.selected];
                let controls = removableControls[this.selected] || [];

                controls.forEach((control: any) => this.deviceForm.removeControl(control));

                this.deviceFormGroup(updateChildData['data']);

                let duplicateDeviceEntry = Array.from({ length: this.fetchedCount },
                    () => ({ ...this.deviceForm.value })
                );

                currentAuth.postDevice(duplicateDeviceEntry).subscribe({
                    next: () => {
                        this.store.dispatch(clearChildData());
                        this.backButton();
                    },
                    error: (error: any) => console.error(error)
                });
            }
        });

        if (history.state.devicedetails || history.state.inventorydetails) {
            const { connectionDTOS, deviceSoftwareDTO, peripheralDTOS } = history.state.devicedetails || history.state.inventorydetails;
            this.connectionsPayload = connectionDTOS;
            this.softwaresPayload = deviceSoftwareDTO;
            this.peripheralsPayload = peripheralDTOS;
        }
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    createDeviceFormGroup(): FormGroup {
        return new FormGroup({
            upsId: new FormControl(0, [Validators.required, Validators.pattern('^[0-9]*$')]),
            peripheralIds: new FormControl(null, [Validators.required]),
            deviceSoftwareRequest: new FormControl(null, [Validators.required]),
            connectionIds: new FormControl(null, [Validators.required])
        });
    }

    //FormGroup Manipulation
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

    //Events
    onPeripheralsChanges(peripheralIds: number[]): void {
        this.deviceForm.patchValue({ peripheralIds: peripheralIds });
    }

    onConnectionChanges(connectionIds: number[]): void {
        this.deviceForm.patchValue({ connectionIds: connectionIds });
    }

    onSoftwareChanges(softwareIds: any[]): void {
        this.deviceForm.patchValue({ deviceSoftwareRequest: softwareIds });
    }

    onUPSBrandIdSubmit(id: number): void {
        this.deviceForm.patchValue({ upsId: id });
    }

    //Functions
    onTogglePeripherals() {
        this.isPeripheralToggled = !this.isPeripheralToggled;
    }

    onToggleConnections() {
        this.isConnectionToggled = !this.isConnectionToggled;
    }

    onToggleSoftwares() {
        this.isSoftwareToggled = !this.isSoftwareToggled;
    }

    backButton() {
        this.store.dispatch(clearChildData());
        if (this.fromComputerInventory) {
            this.router.navigate(['computer-inventory']);
        } else {
            this.router.navigate(['add-batch'], {
                state: { batchdetails: this.batchDetails }
            });
        }
    }
}
