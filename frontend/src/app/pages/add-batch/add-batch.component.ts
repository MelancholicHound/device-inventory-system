import { Component, AfterViewInit, ViewChild, OnInit, ElementRef } from '@angular/core';
import { NgFor } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { forkJoin, map } from 'rxjs';

import { ParamsService } from '../../util/services/params.service';
import { DeviceAioService } from '../../util/services/device-aio.service';
import { DeviceComputerService } from '../../util/services/device-computer.service';
import { DeviceLaptopService } from '../../util/services/device-laptop.service';
import { DevicePrinterService } from '../../util/services/device-printer.service';
import { DeviceRouterService } from '../../util/services/device-router.service';
import { DeviceScannerService } from '../../util/services/device-scanner.service';
import { DeviceServerService } from '../../util/services/device-server.service';
import { DeviceTabletService } from '../../util/services/device-tablet.service';

export interface TableDevice {
    tag: string;
    device: string;
    division: string;
    section: string;
}

@Component({
    selector: 'app-add-batch',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        NgFor
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
    dataSource!: MatTableDataSource<TableDevice>;

    batchDetails: any; batchCounter: any;
    batchEditDetails: any;
    fetchedData: any; deviceSelected: any;
    isAddingBatch!: boolean;

    aioData!: any; computerData!: any;
    laptopData!: any; printerData!: any;
    routerData!: any; scannerData!: any;
    serverData!: any; tabletData!: any;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('addDeviceModal') addDeviceModal!: ElementRef;

    constructor(private router: Router,
                private activeRoute: ActivatedRoute,
                private _params: ParamsService,
                private aioAuth: DeviceAioService,
                private compAuth: DeviceComputerService,
                private lapAuth: DeviceLaptopService,
                private prntAuth: DevicePrinterService,
                private rtAuth: DeviceRouterService,
                private scanAuth: DeviceScannerService,
                private svrAuth: DeviceServerService,
                private tabAuth: DeviceTabletService) {
                this.dataSource = new MatTableDataSource(this.fetchedData);
                this.activeRoute.queryParams.subscribe(params => { this.batchCounter = params['count'] });
                const navigation = this.router.getCurrentNavigation();
                if (navigation?.extras.state) {
                  this.batchEditDetails = navigation.extras.state['details'];
                }
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    ngOnInit(): void {
        if (this.batchCounter) {
            this._params.getBatchDetails(this.batchCounter).subscribe(
                (data: any) => { this.batchDetails = data }
            );

            this.isAddingBatch = true;
        } else if (this.batchEditDetails) {
            this.aioAuth.getAllByBatchId(this.batchEditDetails.id).subscribe(
                (data: any) => {
                    const deviceData = data.map((items: TableDevice) => ({
                        tag: items.tag,
                        device: 'All-In-One',
                        division: items.division,
                        section: items.section
                    }));

                    forkJoin(deviceData).subscribe((result: any) => {
                        this.fetchedData.push(...result);
                    });

                    this.aioData = data;
                }
            );

            this.compAuth.getAllByBatchId(this.batchEditDetails.id).subscribe(
                (data: any) => {
                    const deviceData = data.map((items: TableDevice) => ({
                        tag: items.tag,
                        device: 'Computer',
                        division: items.division,
                        section: items.section
                    }));

                    forkJoin(deviceData).subscribe((result: any) => {
                        this.fetchedData.push(...result);
                    });

                    this.compAuth = data;
                }
            );

            this.lapAuth.getAllByBatchId(this.batchEditDetails.id).subscribe(
                (data: any) => {
                    const deviceData = data.map((items: TableDevice) => ({
                        tag: items.tag,
                        device: 'Laptop',
                        division: items.division,
                        section: items.section
                    }));

                    forkJoin(deviceData).subscribe((result: any) => {
                        this.fetchedData.push(...result);
                    });

                    this.laptopData = data;
                }
            );

            this.prntAuth.getAllByBatchId(this.batchEditDetails.id).subscribe(
                (data: any) => {
                    const deviceData = data.map((items: TableDevice) => ({
                        tag: items.tag,
                        device: 'Printer',
                        division: items.division,
                        section: items.section
                    }));

                    forkJoin(deviceData).subscribe((result: any) => {
                        this.fetchedData.push(...result);
                    });

                    this.printerData = data;
                }
            );

            this.rtAuth.getAllByBatchId(this.batchEditDetails.id).subscribe(
                (data: any) => {
                    const deviceData = data.map((items: TableDevice) => ({
                        tag: items.tag,
                        device: 'Printer',
                        division: items.division,
                        section: items.section
                    }));

                    forkJoin(deviceData).subscribe((result: any) => {
                        this.fetchedData.push(...result);
                    });

                    this.routerData = data;
                }
            );

            this.scanAuth.getAllByBatchId(this.batchEditDetails.id).subscribe(
                (data: any) => {
                    const deviceData = data.map((items: TableDevice) => ({
                        tag: items.tag,
                        device: 'Scanner',
                        division: items.division,
                        section: items.section
                    }));

                    forkJoin(deviceData).subscribe((result: any) => {
                        this.fetchedData.push(...result);
                    });

                    this.scannerData = data;
                }
            );

            this.svrAuth.getAllByBatchId(this.batchEditDetails.id).subscribe(
                (data: any) => {
                    const deviceData = data.map((items: TableDevice) => ({
                        tag: items.tag,
                        device: 'Server',
                        division: items.division,
                        section: items.section
                    }));

                    forkJoin(deviceData).subscribe((result: any) => {
                        this.fetchedData.push(...result);
                    });

                    this.serverData = data;
                }
            );

            this.tabAuth.getAllByBatchId(this.batchEditDetails.id).subscribe(
                (data: any) => {
                    const deviceData = data.map((items: TableDevice) => ({
                        tag: items.tag,
                        device: 'Tablet',
                        division: items.division,
                        section: items.section
                    }));

                    forkJoin(deviceData).subscribe((result: any) => {
                        this.fetchedData.push(...result);
                    });

                    this.tabletData = data;
                }
            );
            this.isAddingBatch = false;
        }
    }

    routeSelectedDevice() {
        var selected = document.getElementById('device') as HTMLSelectElement;
        let count = document.getElementById('count') as HTMLInputElement;
        for (let i = 0; i < this.devices.length; i++) {
            if (selected.value === this.devices[i].name) {
                this.router.navigate([`/add-device/${this.devices[i].indicator}`], { queryParams: { branch: new Date().getTime() } });
                localStorage.setItem('device', this.devices[i].name);
                localStorage.setItem('devicecount', count.value);
            }
        }
    }

    backButton() {
        this.router.navigate(['/batch-delivery'], { queryParams: { main: new Date().getTime() } });
        this._params.deleteBatch(localStorage.getItem('batchcount'));
    }

    openAddDeviceModal() { this.addDeviceModal.nativeElement.style.display = 'block' }

    closeAddDeviceModal() { this.addDeviceModal.nativeElement.style.display = 'none' }
}
