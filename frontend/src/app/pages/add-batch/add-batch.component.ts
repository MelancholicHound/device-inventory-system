import { Component, AfterViewInit, ViewChild, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
    batchEditDetails: any; batchAddDetails: any; batchViewDetails: any;
    fetchedData: any[] = [];
    deviceSelected: any;
    isAddingBatch!: boolean; isViewingBatch!: boolean;

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
                    this.batchViewDetails = navigation.extras.state['viewdetails']
                    this.batchEditDetails = navigation.extras.state['editdetails'];
                    this.batchAddDetails = navigation.extras.state['addbatch'];
                    this.batchDetails = navigation.extras.state['batchdetails'];
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
            this.batchDetails = this.batchViewDetails;
            this.isViewingBatch = true;
            this.isAddingBatch = false;
        }

        this.aioAuth.getAllByBatchId(this.batchDetails.id).subscribe({
            next: (data: any[]) => {
                const payload = data.map((item) => ({
                    tag: item.tag,
                    device: 'ALL-IN-ONE',
                    division: item.sectionDTO.divisionId,
                    section: item.sectionDTO.name
                }));

                this.fetchedData.push(...payload);
            }
        })

        this.computerAuth.getAllByBatchId(this.batchDetails.id).subscribe({
            next: (data: any[]) => {
                const payload = data.map((item) => ({
                    tag: item.tag,
                    device: 'COMPUTER',
                    division: item.sectionDTO.divisionId,
                    section: item.sectionDTO.name
                }));

                this.fetchedData.push(...payload);
            },
            error: (error: any) => console.log(error)
        });

        this.laptopAuth.getAllByBatchId(this.batchDetails.id).subscribe({
            next: (data: any[]) => {
                const payload = data.map((item) => ({
                    tag: item.tag,
                    device: 'LAPTOP',
                    division: item.sectionDTO.divisionId,
                    section: item.sectionDTO.name
                }));

                this.fetchedData.push(...payload);
            },
            error: (error: any) => console.log(error)
        });

        this.printerAuth.getAllByBatchId(this.batchDetails.id).subscribe({
            next: (data: any[]) => {
                const payload = data.map((item) => ({
                    tag: item.tag,
                    device: 'PRINTER',
                    division: item.sectionDTO.divisionId,
                    section: item.sectionDTO.name
                }));

                this.fetchedData.push(...payload);
            },
            error: (error: any) => console.log(error)
        });

        this.routerAuth.getAllByBatchId(this.batchDetails.id).subscribe({
            next: (data: any[]) => {
                const payload = data.map((item) => ({
                    tag: item.tag,
                    device: 'ROUTER',
                    division: item.sectionDTO.divisionId,
                    section: item.sectionDTO.name
                }));

                this.fetchedData.push(...payload);
            },
            error: (error: any) => console.log(error)
        });

        this.scannerAuth.getAllByBatchId(this.batchDetails.id).subscribe({
            next: (data: any[]) => {
                const payload = data.map((item) => ({
                    tag: item.tag,
                    device: 'SCANNER',
                    division: item.sectionDTO.divisionId,
                    section: item.sectionDTO.name
                }));

                this.fetchedData.push(...payload);
            },
            error: (error: any) => console.log(error)
        });

        this.serverAuth.getAllByBatchId(this.batchDetails.id).subscribe({
            next: (data: any[]) => {
                const payload = data.map((item) => ({
                    tag: item.tag,
                    device: 'SERVER',
                    division: item.sectionDTO.divisionId,
                    section: item.sectionDTO.name
                }));

                this.fetchedData.push(...payload);
            },
            error: (error: any) => console.log(error)
        });

        this.tabletAuth.getAllByBatchId(this.batchDetails.id).subscribe({
            next: (data: any[]) => {
                const payload = data.map((item) => ({
                    tag: item.tag,
                    device: 'TABLET',
                    division: item.sectionDTO.divisionId,
                    section: item.sectionDTO.name
                }));

                this.fetchedData.push(...payload);
                console.log(this.fetchedData);
            },
            error: (error: any) => console.log(error)
        })



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
                this.router.navigate([`add-device/${this.devices[i].indicator}`], { state: {
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

    //To be configured into a warning modal
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
        } else {
          this.router.navigate(['/batch-delivery']);
        }
    }
}
