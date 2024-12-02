import { Component, AfterViewInit, OnInit, ViewChild, inject, ElementRef } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
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

    componentPayload: any[] = [];

    fetchedData: DeviceTable[] = [];
    fetchedCondemned: any; componentChosen: any;
    toCondemn: any;

    private formBuilder = inject(FormBuilder);

    componentForm = this.formBuilder.group({
        component: [null, Validators.required],
        isComponentExisting: [Validators.required]
    });

    newComponentForm = this.formBuilder.group({
        capacityId: [Validators.required]
    });

    existingComponentForm = this.formBuilder.group({
        deviceId: [Validators.required],
        componentId: [Validators.required]
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
                this.dataSource.data = this.fetchedData;
            }
        })
    }

    //GET
    getComponent(event: Event) {
        let componentSelect = document.getElementById('component') as HTMLSelectElement;
        this.componentChosen = componentSelect.value;
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
                status: item.condemnedDTO
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
    }

    //Events
    onClickEdit(row: any) {
        const mapping = this.deviceMappings.find(m => row.tag.includes(m.key));

        if (mapping) {
            mapping.service.getById(row.id).subscribe({
                next: (res: any) => {
                    this.router.navigate([mapping.route], {
                        state: { device: mapping.device, inventorydetails: res },
                        queryParams: { deviceinventory: true }
                    });
                },
                error: (error: any) => console.error(error)
            });
        }
    }

    onClickChange(row: any) {
        this.changePartModal.nativeElement.style.display = 'block';
        console.log(row);
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
