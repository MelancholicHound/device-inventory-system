import { Component, AfterViewInit, ViewChild, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { forkJoin, firstValueFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

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
    device: string;
    division: number;
    section: string;
    createdAt: any;
}

@Component({
    selector: 'app-add-batch',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatMenuModule,
        MatButtonModule
    ],
    providers: [
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
    templateUrl: './add-batch.component.html',
    styleUrl: './add-batch.component.scss'
})
export class AddBatchComponent implements AfterViewInit, OnInit {
    displayedColumns: string[] = ['tag', 'device', 'division', 'section', 'settings'];
    devices: any[] = [
        { name: 'Computer', indicator: 'computer' },
        { name: 'Laptop', indicator: 'laptop' },
        { name: 'Tablet', indicator: 'tablet' },
        { name: 'Printer', indicator: 'printer' },
        { name: 'Router', indicator: 'router' },
        { name: 'Scanner', indicator: 'scanner' },
        { name: 'AIO', indicator: 'aio' },
        { name: 'Server', indicator: 'server' }
    ];

    dataSource!: MatTableDataSource<DeviceTable>;

    batchDetails: any;
    state: any = localStorage.getItem('state');
    private previousFetchedData: any[] = [];
    dataChanged!: boolean;
    fetchedData: DeviceTable[] = [];
    deviceSelected: any;
    isAddingBatch!: boolean;

    fetchedAIO: any; fetchedComputer: any; fetchedLaptop: any;
    fetchedPrinter: any; fetchedRouter: any; fetchedScanner: any;
    fetchedServer: any; fetchedTablet: any;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    @ViewChild('addDeviceModal') addDeviceModal!: ElementRef;

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
                const navigation = this.router.getCurrentNavigation();
                if (navigation?.extras.state) {
                    if (navigation.extras.state['viewdetails']) {
                        this.batchDetails = navigation.extras.state['viewdetails'];
                        navigation.extras.state['viewdetails'] = undefined;
                    } else if (navigation.extras.state['editdetails']) {
                        this.batchDetails = navigation.extras.state['editdetails'];
                        navigation.extras.state['editdetails'] = undefined;
                    } else if (navigation.extras.state['addbatch']) {
                        this.batchDetails = navigation.extras.state['addbatch'];
                        navigation.extras.state['addbatch'] = undefined;
                    } else if (navigation.extras.state['batchdetails']) {
                        this.batchDetails = navigation.extras.state['batchdetails'];
                        navigation.extras.state['batchdetails'] = undefined;
                    }
                }
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    ngOnInit(): void {
        if (localStorage.getItem('state') === 'ADD') {
            this.isAddingBatch = true;
        } else if (localStorage.getItem('state') === 'EDIT') {
            this.isAddingBatch = false;
        }

        forkJoin([
            this.aioAuth.getAllByBatchId(this.batchDetails.id).pipe(
                switchMap((data: any[]) => this.mapData(data, 'AIO'))
            ),
            this.computerAuth.getAllByBatchId(this.batchDetails.id).pipe(
                switchMap((data: any[]) => this.mapData(data, 'COMPUTER'))
            ),
            this.laptopAuth.getAllByBatchId(this.batchDetails.id).pipe(
                switchMap((data: any[]) => this.mapData(data, 'LAPTOP'))
            ),
            this.printerAuth.getAllByBatchId(this.batchDetails.id).pipe(
                switchMap((data: any[]) => this.mapData(data, 'PRINTER'))
            ),
            this.routerAuth.getAllByBatchId(this.batchDetails.id).pipe(
                switchMap((data: any[]) => this.mapData(data, 'ROUTER'))
            ),
            this.scannerAuth.getAllByBatchId(this.batchDetails.id).pipe(
                switchMap((data: any[]) => this.mapData(data, 'SCANNER'))
            ),
            this.serverAuth.getAllByBatchId(this.batchDetails.id).pipe(
                switchMap((data: any[]) => this.mapData(data, 'SERVER'))
            ),
            this.tabletAuth.getAllByBatchId(this.batchDetails.id).pipe(
                switchMap((data: any[]) => this.mapData(data, 'TABLET'))
            )
        ]).subscribe({
            next: (results: any[]) => {
                const newFetchedData = results.flat();
                newFetchedData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                const isDataChanged = !this.isArraysEqual(this.previousFetchedData, newFetchedData);

                this.dataChanged = isDataChanged;
                this.previousFetchedData = [...newFetchedData];
                this.fetchedData = newFetchedData;
                this.dataSource.data = this.fetchedData;
            },
            error: (error: any) => console.log(error)
        });
    }

    //Functions
    routeSelectedDevice() {
        let selectedDeviceName = (document.getElementById('device') as HTMLSelectElement)?.value;
        let countValue = (document.getElementById('count') as HTMLInputElement)?.value;

        let selectedDevice = this.devices.find(device => device.name === selectedDeviceName);

        if (selectedDevice) {
            this.router.navigate([`add-device/${selectedDevice.indicator}`], {
                state: {
                    device: selectedDevice.name,
                    batchdetails: this.batchDetails,
                    count: countValue,
                    batchnumber: this.batchDetails.formattedId,
                    batchid: this.batchDetails.id
                },
                queryParams: {
                    isAdding: this.isAddingBatch
                }
            })
        }
    }

    mapData(data: any[], deviceType: string) {
        return Promise.all(data.map(async (item) => {
            let division = firstValueFrom(this.params.getDivisionById(item.sectionDTO.divisionId));

            return division.then(value => ({
                id: item.id, tag: item.tag,
                device: deviceType, division: value.name,
                section: item.sectionDTO.name, createdAt: item.createdAt
            }));
        }));
    }

    private isArraysEqual(arr1: any[], arr2: any[]): boolean {
        if (arr1.length !== arr2.length) {
            return false;
        }

        return arr1.every((item, index) => JSON.stringify(item) === JSON.stringify(arr2[index]));
    }

    //Events
    onClickEditDevice(row: any) {
        let authServices: any = {
            COMPUTER: this.computerAuth, LAPTOP: this.laptopAuth,
            TABLET: this.tabletAuth, PRINTER: this.printerAuth,
            ROUTER: this.routerAuth, SCANNER: this.scannerAuth,
            AIO: this.aioAuth, SERVER: this.serverAuth
        };

        if (row.device in authServices) {
            let currentAuth = authServices[row.device];

            currentAuth.getById(row.id).subscribe({
                next: (res: any) => {
                    let deviceIndicator = this.devices.filter((device: any) => row.device === device.name.toUpperCase());
                    this.router.navigate([`add-device/${deviceIndicator[0].indicator}`], {
                        state: {
                            device: deviceIndicator[0].name, devicedetails: res,
                            batchdetails: this.batchDetails, batchnumber: this.batchDetails.formattedId,
                            batchid: this.batchDetails.id
                        },
                        queryParams: {
                            isAdding: this.isAddingBatch
                        }
                    });
                }
            })
        }
    }

    onClickDeleteDevice(row: any) {
        let authServices: any = {
            COMPUTER: this.computerAuth, LAPTOP: this.laptopAuth,
            TABLET: this.tabletAuth, PRINTER: this.printerAuth,
            ROUTER: this.routerAuth, SCANNER: this.scannerAuth,
            AIO: this.aioAuth, SERVER: this.serverAuth
        };

        if (row.device in authServices) {
            let currentAuth = authServices[row.device];

            currentAuth.deleteById(row.id).subscribe({
                next: () => location.reload(),
                error: (error: any) => console.error(error)
            });
        }
    }

    //To be configured into a warning modal
    backButton() {
        this.router.navigate(['batch-delivery']);
    }
}
