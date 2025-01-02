import { Component, AfterViewInit, OnInit, ViewChild, inject, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';

import { forkJoin, firstValueFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ParamsService } from '../../util/services/params.service';
import { DeviceAioService } from '../../util/services/device-aio.service';
import { DeviceComputerService } from '../../util/services/device-computer.service';
import { DeviceLaptopService } from '../../util/services/device-laptop.service';
import { DevicePrinterService } from '../../util/services/device-printer.service';
import { DeviceRouterService } from '../../util/services/device-router.service';
import { DeviceScannerService } from '../../util/services/device-scanner.service';
import { DeviceServerService } from '../../util/services/device-server.service';
import { DeviceTabletService } from '../../util/services/device-tablet.service';

export interface DeviceTable {
    tag: string;
    division: string;
    section: string;
    status: any;
    createdAt: any;
}

@Component({
    selector: 'app-computer-inventory',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatMenuModule,
        MatButtonModule,
        MatStepperModule
    ],
    providers: [
        {
            provide: STEPPER_GLOBAL_OPTIONS,
            useValue: { showError: true }
        },
        ParamsService,
        DeviceAioService,
        DeviceComputerService,
        DeviceLaptopService,
        DevicePrinterService,
        DeviceRouterService,
        DeviceScannerService,
        DeviceServerService,
        DeviceTabletService
    ],
    templateUrl: './computer-inventory.component.html',
    styleUrl: './computer-inventory.component.scss'
})

export class ComputerInventoryComponent implements AfterViewInit, OnInit {
    displayedColumns: string[] = ['tag', 'division', 'section', 'status', 'settings'];
    dataSource!: MatTableDataSource<DeviceTable>; isExisting: any;
    deviceMappings = [
        { key: 'PJG-AIO', service: this.aioAuth, route: 'add-device/aio', device: 'AIO', indicator: 'aio' },
        { key: 'PJG-COMP', service: this.computerAuth, route: 'add-device/computer', device: 'Computer' },
        { key: 'PJG-LAP', service: this.laptopAuth, route: 'add-device/laptop', device: 'Laptop' },
        { key: 'PJG-PRNT', service: this.printerAuth, route: 'add-device/printer', device: 'Printer' },
        { key: 'PJG-RT', service: this.routerAuth, route: 'add-device/router', device: 'Router' },
        { key: 'PJG-SCAN', service: this.scannerAuth, route: 'add-device/scanner', device: 'Scanner' },
        { key: 'PJG-TAB', service: this.tabletAuth, route: 'add-device/tablet', device: 'Tablet' }
    ];

    components: any[] = ['Processor', 'RAM', 'Storage', 'Video Card'];

    fetchedData: DeviceTable[] = [];
    componentChosen: any;
    toCondemn: any; toChange: any;
    condemnedUnits: any; condemnedParts: any[] = []; condemnedDevice: any;

    deviceForm!: FormGroup;
    changeNewPartForm!: FormGroup;
    changeExistingPartForm!: FormGroup;
    upgradeNewPartForm!: FormGroup;
    upgradeExistingPartForm!: FormGroup;

    private formBuilder = inject(FormBuilder);

    condemnForm = this.formBuilder.group({
        id: [null],
        condemnedAt: [null, Validators.required],
        reason: [null, Validators.required]
    })

    componentForm = this.formBuilder.group({
        component: [null, Validators.required],
        isComponentExisting: [null, Validators.required]
    });

    @ViewChild('changePartModal') changePartModal!: ElementRef;
    @ViewChild('upgradePartModal') upgradePartModal!: ElementRef;
    @ViewChild('condemnUnitModal') condemnUnitModal!: ElementRef;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(private router: Router,
                private params: ParamsService,
                private aioAuth: DeviceAioService,
                private computerAuth: DeviceComputerService,
                private laptopAuth: DeviceLaptopService,
                private printerAuth: DevicePrinterService,
                private routerAuth: DeviceRouterService,
                private scannerAuth: DeviceScannerService,
                private serverAuth: DeviceServerService,
                private tabletAuth: DeviceTabletService) {
                    this.dataSource = new MatTableDataSource(this.fetchedData);

                    this.changeNewPartForm = this.changeToNewPartForm();
                    this.changeExistingPartForm = this.changeToExistingPartForm();
                    this.upgradeExistingPartForm = this.upgradeToExistingPartForm();
                    this.upgradeNewPartForm = this.upgradeToNewPartForm();
                    this.deviceForm = this.createDeviceForm();
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    ngOnInit(): void {
        forkJoin([
            this.aioAuth.getAllActiveDevice().pipe(
                switchMap((data: any[]) => this.mapData(data))
            ),
            this.aioAuth.getAllCondemnedDevice().pipe(
                switchMap((data: any[]) => this.mapData(data))
            ),
            this.computerAuth.getAllActiveDevice().pipe(
                switchMap((data: any[]) => this.mapData(data))
            ),
            this.computerAuth.getAllCondemnedDevice().pipe(
                switchMap((data: any[]) => this.mapData(data))
            ),
            this.laptopAuth.getAllActiveDevice().pipe(
                switchMap((data: any[]) => this.mapData(data))
            ),
            this.laptopAuth.getAllCondemnedDevice().pipe(
                switchMap((data: any[]) => this.mapData(data))
            ),
            this.printerAuth.getAllActiveDevice().pipe(
                switchMap((data: any[]) => this.mapData(data))
            ),
            this.printerAuth.getAllCondemnedDevice().pipe(
                switchMap((data: any[]) => this.mapData(data))
            ),
            this.routerAuth.getAllActiveDevice().pipe(
                switchMap((data: any[]) => this.mapData(data))
            ),
            this.routerAuth.getAllCondemnedDevice().pipe(
                switchMap((data: any[]) => this.mapData(data))
            ),
            this.scannerAuth.getAllActiveDevice().pipe(
                switchMap((data: any[]) => this.mapData(data))
            ),
            this.scannerAuth.getAllCondemnedDevice().pipe(
                switchMap((data: any[]) => this.mapData(data))
            ),
            this.serverAuth.getAllActiveDevice().pipe(
                switchMap((data: any[]) => this.mapData(data))
            ),
            this.serverAuth.getAllCondemnedDevice().pipe(
                switchMap((data: any[]) => this.mapData(data))
            ),
            this.tabletAuth.getAllActiveDevice().pipe(
                switchMap((data: any[]) => this.mapData(data))
            ),
            this.tabletAuth.getAllCondemnedDevice().pipe(
                switchMap((data: any[]) => this.mapData(data))
            )
        ]).subscribe({
            next: (result: any[]) => {
                this.fetchedData = result.flat();
                this.fetchedData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                this.dataSource.data = this.fetchedData;
            }
        });
    }

    createDeviceForm(): FormGroup {
        return new FormGroup({
            fromDeviceId: new FormControl(null, [Validators.pattern('^[0-9]*$')]),
            toDeviceId: new FormControl(null, [Validators.pattern('^[0-9]*$')])
        });
    }

    changeToNewPartForm(): FormGroup {
        return new FormGroup({
            cpuRequest: new FormGroup({
                cpuBrandId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
                cpuBrandSeriesId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
                cpuModifier: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')])
            }),
            videoCardRequest: new FormGroup({ capacityId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]) }),
            storageRequests: new FormArray([], [Validators.required]),
            ramRequests: new FormArray([], [Validators.required]),
        });
    }

    changeToExistingPartForm(): FormGroup {
        return new FormGroup({
            fromStorageId: new FormControl(null, [Validators.pattern('^[0-9]*$')]),
            toStorageId: new FormControl(null, [Validators.pattern('^[0-9]*$')]),
            fromRAMId: new FormControl(null, [Validators.pattern('^[0-9]*$')]),
            toRAMId: new FormControl(null, [Validators.pattern('^[0-9]*$')])
        });
    }

    upgradeToNewPartForm(): FormGroup {
        return new FormGroup({
            storageRequests: new FormArray([], [Validators.required]),
            ramRequests: new FormArray([], [Validators.required])
        });
    }

    upgradeToExistingPartForm(): FormGroup {
        return new FormGroup({
            fromDeviceId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            storageId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            ramId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')])
        });
    }

    //GET
    getComponent(event: Event) {
        let selectElement = event.target as HTMLSelectElement;

        this.componentChosen = selectElement.value;
    }

    getPartsFrom(event: Event) {
        let selectElement = (event.target as HTMLSelectElement).value;
        let parts = selectElement.split('-');
        this.condemnedDevice = selectElement;

        if (parts.length === 3) {
            let prefix = `${parts[0]}-${parts[1]}`;
            let id = parseInt(parts[2], 10);

            this.deviceForm.patchValue({ fromDeviceId: id });
            this.deviceForm.patchValue({ toDeviceId: this.toChange.id });

            let mappedAuth = this.deviceMappings.find((map: any) => map.key === prefix);

            if (mappedAuth) {
                mappedAuth.service.getById(id).subscribe({
                    next: (res: any) => {
                        const { ramDTOs, cpuDTO, storageDTOs, videoCardDTO } = res;
                        switch (this.componentChosen) {
                            case 'Processor':
                                this.condemnedParts = [cpuDTO];
                                break;
                            case 'RAM':
                                this.condemnedParts = ramDTOs;
                                break;
                            case 'Storage':
                                this.condemnedParts = storageDTOs;
                                break;
                            case 'Video Card':
                                this.condemnedParts = [videoCardDTO];
                                break;
                            default:
                                break;
                        }
                    },
                    error: (error: any) => {
                        console.error(error);
                    }
                })
            }
        }
    }

    //POST
    changePart() {
        let changeableDevices = [
            { key: 'PJG-AIO', service: this.aioAuth, route: 'add-device/aio', device: 'AIO', indicator: 'aio' },
            { key: 'PJG-COMP', service: this.computerAuth, route: 'add-device/computer', device: 'Computer' },
            { key: 'PJG-LAP', service: this.laptopAuth, route: 'add-device/laptop', device: 'Laptop' },
        ]

        let prefix = this.toChange.tag?.split('-').slice(0, 2).join('-');
        let mappedAuth = changeableDevices.find((map: any) => map.key === prefix);

        console.log(this.deviceForm.value);
        if (mappedAuth) {
            switch (this.componentChosen) {
                case 'Processor':
                    mappedAuth.service.changeWithExistingProcessor(this.deviceForm.value).subscribe({
                        next: () => window.location.reload(),
                        error: (error: any) => console.error(error)
                    });
                    break;
                case 'RAM':
                    ['fromStorage', 'toStorageId'].forEach(control => this.changeExistingPartForm.removeControl(control));
                    mappedAuth.service.changeWithExistingRAM(this.deviceForm.value, this.changeExistingPartForm.value).subscribe({
                        next: () => window.location.reload(),
                        error: (error: any) => console.error(error)
                    });
                    break;
                case 'Storage':
                    ['fromStorage', 'toStorageId'].forEach(control => this.changeExistingPartForm.removeControl(control));
                    mappedAuth.service.changeWithExistingStorage(this.deviceForm.value, this.changeExistingPartForm.value).subscribe({
                        next: () => window.location.reload(),
                        error: (error: any) => console.error(error)
                    });
                    break;
                case 'Video Card':
                    mappedAuth.service.changeWithExistingGPU(this.deviceForm.value).subscribe({
                        next: () => window.location.reload(),
                        error: (error: any) => console.error(error)
                    });
                    break;
                default:
                    break;
            }
        }
    }

    //PATCH
    condemnDevice() {
        let prefix = this.toCondemn.tag?.split('-').slice(0, 2).join('-');

        let mappedAuth = this.deviceMappings.find((map: any) => map.key === prefix);

        if (mappedAuth) {
            this.condemnForm.get('id')?.setValue(this.toCondemn.id);
            console.log(this.condemnForm.value);
            mappedAuth.service.condemnDevice(this.condemnForm.value).subscribe({
                next: () => window.location.reload(),
                error: () => this.condemnForm.reset()
            });
        }
    }

    //Functions
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    mapData(data: any[]) {
        return Promise.all(data.map(async (item) => {
            let division = firstValueFrom(this.params.getDivisionById(item.sectionDTO.divisionId));

            return division.then(value => ({
                id: item.id, tag: item.tag,
                division: value.name, section: item.sectionDTO.name,
                status: item.condemnedDTO, createdAt: item.createdAt
            }));
        }));
    }

    routeSelectedDevice() {
        let selectedDeviceName = (document.getElementById('device') as HTMLSelectElement)?.value;
        let countValue = (document.getElementById('count') as HTMLInputElement)?.value;

        let selectedDevice = this.deviceMappings.find(device => device.device === selectedDeviceName);

        if (selectedDevice) {
            this.router.navigate([`${selectedDevice.route}`], {
                state: { device: selectedDevice.device, count: countValue },
                queryParams: { deviceinventory: true }
            });
        }
    }

    nextIsExisting() {
        this.isExisting = this.componentForm.get('isComponentExisting')?.value;

        if (this.toChange.tag.includes('PJG-AIO')) {
            forkJoin([
                this.aioAuth.getAllCondemnedDevice().pipe(
                    switchMap((data: any[]) => this.mapData(data))
                )
            ]).subscribe({
                next: (result: any[]) => this.condemnedUnits = result.flat()
            });
        } else if (this.toChange.tag.includes('PJG-COMP')) {
            forkJoin([
                this.computerAuth.getAllCondemnedDevice().pipe(
                    switchMap((data: any[]) => this.mapData(data))
                )
            ]).subscribe({
                next: (result: any[]) => this.condemnedUnits = result.flat()
            });
        } else if (this.toChange.tag.includes('PJG-LAP')) {
            forkJoin([
                this.laptopAuth.getAllCondemnedDevice().pipe(
                    switchMap((data: any[]) => this.mapData(data))
                )
            ]).subscribe({
                next: (result: any[]) => this.condemnedUnits = result.flat()
            });
        }
    }

    closeChangePartModal() {
        window.location.reload();
    }

    //Events
    onClickEdit(row: any) {
        const mapping = this.deviceMappings.find(m => row.tag.includes(m.key));

        if (mapping) {
            mapping.service.getById(row.id).subscribe({
                next: (res: any) => {
                    this.params.getBatchDetails(res.batchId).subscribe({
                        next: (batch: any) => {
                            this.router.navigate([mapping.route], {
                                state: { device: mapping.device, inventorydetails: res, batchnumber: batch.formattedId },
                                queryParams: { deviceinventory: true }
                            });
                        },
                        error: (error: any) => console.error(error)
                    });
                },
                error: (error: any) => console.error(error)
            });
        }
    }

    onClickChange(row: any) {
        this.changePartModal.nativeElement.style.display = 'block';
        const mapping = this.deviceMappings.find(m => row.tag.includes(m.key));

        if (mapping) {
            mapping.service.getById(row.id).subscribe({
                next: (res: any) => this.toChange = res,
                error: (error: any) => console.error(error)
            });
        }
    }

    onClickUpgrade(row: any) {
        this.upgradePartModal.nativeElement.style.display = 'block';
        console.log(row);
    }


    onClickCondemn(row: any) {
        this.condemnUnitModal.nativeElement.style.display = 'block';
        this.toCondemn = row;
    }
}
