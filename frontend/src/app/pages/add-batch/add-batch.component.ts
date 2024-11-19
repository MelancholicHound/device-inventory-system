import { Component, AfterViewInit, ViewChild, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { forkJoin, map } from 'rxjs';

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
    fetchedData: DeviceTable[] = [];
    deviceSelected: any;
    isAddingBatch!: boolean; isViewingBatch!: boolean;

    fetchedAIO: any; fetchedComputer: any; fetchedLaptop: any;
    fetchedPrinter: any; fetchedRouter: any; fetchedScanner: any;
    fetchedServer: any; fetchedTablet: any;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    @ViewChild('addDeviceModal') addDeviceModal!: ElementRef;

    constructor(private router: Router,
                private _params: ParamsService,
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
            this.isViewingBatch = false;
        } else if (localStorage.getItem('state') === 'EDIT') {
            this.isAddingBatch = false;
            this.isViewingBatch = false;
        } else if (localStorage.getItem('state') === 'VIEW') {
            this.isViewingBatch = true;
            this.isAddingBatch = false;
        }

        forkJoin([
            this.aioAuth.getAllByBatchId(this.batchDetails.id).pipe(
                map((data: any[]) => this.mapData(data, 'ALL-IN-ONE'))
            ),
            this.computerAuth.getAllByBatchId(this.batchDetails.id).pipe(
                map((data: any[]) => this.mapData(data, 'COMPUTER'))
            ),
            this.laptopAuth.getAllByBatchId(this.batchDetails.id).pipe(
                map((data: any[]) => this.mapData(data, 'LAPTOP'))
            ),
            this.printerAuth.getAllByBatchId(this.batchDetails.id).pipe(
                map((data: any[]) => this.mapData(data, 'PRINTER'))
            ),
            this.routerAuth.getAllByBatchId(this.batchDetails.id).pipe(
                map((data: any[]) => this.mapData(data, 'ROUTER'))
            ),
            this.scannerAuth.getAllByBatchId(this.batchDetails.id).pipe(
                map((data: any[]) => this.mapData(data, 'SCANNER'))
            ),
            this.serverAuth.getAllByBatchId(this.batchDetails.id).pipe(
                map((data: any[]) => this.mapData(data, 'SERVER'))
            ),
            this.tabletAuth.getAllByBatchId(this.batchDetails.id).pipe(
                map((data: any[]) => this.mapData(data, 'TABLET'))
            )
        ]).subscribe({
            next: (results: any[]) => {
                this.fetchedData = [
                    ...results[0], ...results[1],
                    ...results[2], ...results[3],
                    ...results[4], ...results[5],
                    ...results[6], ...results[7]
                ];
                this.dataSource.data = this.fetchedData;
            },
            error: (error: any) => console.log(error)
        });

        if (this.state === 'ADD') {
            this.isAddingBatch = true;
            this.isViewingBatch = false;
        } else if (this.state === 'EDIT') {
            this.isAddingBatch = false;
            this.isViewingBatch = false;
        } else if (this.state === 'VIEW') {
            this.isViewingBatch = true;
            this.isAddingBatch = false;
        }
    }

    routeSelectedDevice() {
        var selected = document.getElementById('device') as HTMLSelectElement;
        let count = document.getElementById('count') as HTMLInputElement;
        for (let i = 0; i < this.devices.length; i++) {
            if (selected.value === this.devices[i].name) {
                this.router.navigate([`/add-device/${this.devices[i].indicator}`], { state: {
                    device: this.devices[i].name,
                    batchdetails: this.batchDetails,
                    count: count.value,
                    batchnumber: this.batchDetails.formattedId,
                    batchid: this.batchDetails.id
                }});
                this.addDeviceModal.nativeElement.style.display = 'none';
                selected.selectedIndex = 0; count.value = '';
            }
        }
    }

    mapData(data: any[], deviceType: string) {
        return data.map((item) => ({
            tag: item.tag,
            device: deviceType,
            division: item.sectionDTO.divisionId,
            section: item.sectionDTO.name
        }));
    }

    //To be configured into a warning modal
    backButton() {
        if (localStorage.getItem('state') === 'ADD') {
            this._params.getAllBatches().subscribe({
                next: (data: any) => {
                    for (let i = 0; i < data.length; i++) {
                        if (this.batchDetails.formattedId === data[i].formattedId) {
                            this._params.deleteBatch(data[i].id).subscribe({
                                next: () => { this.router.navigate(['/batch-delivery']) },
                                error: (error: any) => { console.log(error) }
                            });
                        }
                    }
                },
                error: (error: any) => { console.log(error) }
            });
        } else {
          this.router.navigate(['/batch-delivery']);
        }
    }
}
