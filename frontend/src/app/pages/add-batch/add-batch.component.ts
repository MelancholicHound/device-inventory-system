import { Component, AfterViewInit, ViewChild, OnInit, ElementRef } from '@angular/core';
import { NgFor } from '@angular/common';
import { Router } from '@angular/router';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

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

    batchDetails: any;
    batchEditDetails: any; batchAddDetails: any; batchViewDetails: any;
    fetchedData!: any[]; deviceSelected: any;
    isAddingBatch!: boolean; isViewingBatch!: boolean;

    aioData!: any; computerData!: any;
    laptopData!: any; printerData!: any;
    routerData!: any; scannerData!: any;
    serverData!: any; tabletData!: any;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('addDeviceModal') addDeviceModal!: ElementRef;

    constructor(private router: Router,
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
                const navigation = this.router.getCurrentNavigation();
                if (navigation?.extras.state) {
                    this.batchViewDetails = navigation.extras.state['viewdetails']
                    this.batchEditDetails = navigation.extras.state['editdetails'];
                    this.batchAddDetails = navigation.extras.state['addbatch'];
                }
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    ngOnInit(): void {
        if (this.batchAddDetails) {
            this.batchDetails = this.batchAddDetails;
            this.isAddingBatch = true;
            this.isViewingBatch = false;
        } else if (this.batchEditDetails) {
            this.batchDetails = this.batchEditDetails;
            this.isAddingBatch = false;
            this.isViewingBatch = false;
        } else if (this.batchViewDetails) {
            this.isViewingBatch = true;
            this.isAddingBatch = false;
        }
    }

    routeSelectedDevice() {
        var selected = document.getElementById('device') as HTMLSelectElement;
        let count = document.getElementById('count') as HTMLInputElement;
        for (let i = 0; i < this.devices.length; i++) {
            if (selected.value === this.devices[i].name) {
                this.router.navigate([`add-device/${this.devices[i].indicator}`], { state: { device: this.devices[i].name, count: count.value, batchnumber: this.batchDetails.id, batchid: this.batchDetails.formattedId } });
                this.addDeviceModal.nativeElement.style.display = 'none';
                selected.selectedIndex = 0; count.value = '';
            }
        }
    }

    backButton() {
        if (this.batchAddDetails) {
            this._params.getAllBatches().subscribe({
                next: (data: any) => {
                    for (let i = 0; i < data.length; i++) {
                        if (this.batchDetails.formattedId === data[i].formattedId) {
                            this._params.deleteBatch(data[i].id).subscribe({
                                next: () => { this.router.navigate(['batch-delivery']) },
                                error: (error: any) => { console.log(error) }
                            });
                        }
                    }
                },
                error: (error: any) => { console.log(error) }
            });
        } else { this.router.navigate(['/batch-delivery']) }
    }
}
