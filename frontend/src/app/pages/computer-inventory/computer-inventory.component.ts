import { Component, AfterViewInit, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

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
        MatFormFieldModule,
        MatInputModule,
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
    templateUrl: './computer-inventory.component.html',
    styleUrl: './computer-inventory.component.scss'
})

export class ComputerInventoryComponent implements AfterViewInit, OnInit {
    displayedColumns: string[] = ['tag', 'division', 'section', 'status', 'settings'];
    dataSource!: MatTableDataSource<DeviceTable>;
    devices: any[] = [
        { name: 'Computer', indicator: 'computer' },
        { name: 'Laptop', indicator: 'laptop' },
        { name: 'Tablet', indicator: 'tablet' },
        { name: 'Printer', indicator: 'printer' },
        { name: 'Router', indicator: 'router' },
        { name: 'Scanner', indicator: 'scanner' },
        { name: 'AIO', indicator: 'aio' }
    ];

    fetchedData: DeviceTable[] = [];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    @ViewChild('addDevModal') addDevModal!: ElementRef;
    @ViewChild('filterModal') filterModal!: ElementRef;

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
                this.dataSource = new MatTableDataSource(this.fetchedData)
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

    routeSelectedDevice() {
        let selectedDeviceName = (document.getElementById('device') as HTMLSelectElement)?.value;
        let countValue = (document.getElementById('count') as HTMLInputElement)?.value;

        let selectedDevice = this.devices.find(device => device.name === selectedDeviceName);

        if (selectedDevice) {
            this.router.navigate([`add-device/${selectedDevice.indicator}`], {
                state: { device: selectedDevice.name, count: countValue },
                queryParams: { deviceinventory: true }
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
                status: item.condemnedDTO
            }));
        }));
    }

    //Events
    onClickEdit(row: any) {
        if (row.tag.includes('PJG-AIO')) {
            this.aioAuth.getById(row.id).subscribe({
                next: (res: any) => {
                    this.router.navigate(['add-device/aio'], {
                        state: { device: 'AIO', inventorydetails: res },
                        queryParams: { deviceinventory: true }
                    });
                },
                error: (error: any) => console.error(error)
            });
        } else if (row.tag.includes('PJG-COMP')) {
            this.computerAuth.getById(row.id).subscribe({
                next: (res: any) => {
                    this.router.navigate(['add-device/computer'], {
                        state: { device: 'Computer', inventorydetails: res },
                        queryParams: { deviceinventory: true }
                    });
                },
                error: (error: any) => console.error(error)
            });
        } else if (row.tag.includes('PJG-LAP')) {
            this.laptopAuth.getById(row.id).subscribe({
                next: (res: any) => {
                    this.router.navigate(['add-device/laptop'], {
                        state: { device: 'Laptop', inventorydetails: res },
                        queryParams: { deviceinventory: true }
                    });
                },
                error: (error: any) => console.error(error)
            });
        } else if (row.tag.includes('PJG-PRNT')) {
            this.printerAuth.getById(row.id).subscribe({
                next: (res: any) => {
                    this.router.navigate(['add-device/printer'], {
                        state: { device: 'Printer', inventorydetails: res },
                        queryParams: { deviceinventory: true }
                    });
                },
                error: (error: any) => console.error(error)
            });
        } else if (row.tag.includes('PJG-RT')) {
            this.routerAuth.getById(row.id).subscribe({
                next: (res: any) => {
                    this.router.navigate(['add-device/router'], {
                        state: { device: 'Router', inventorydetails: res },
                        queryParams: { deviceinventory: true }
                    });
                },
                error: (error: any) => console.error(error)
            });
        } else if (row.tag.includes('PJG-SCAN')) {
            this.scannerAuth.getById(row.id).subscribe({
                next: (res: any) => {
                    this.router.navigate(['add-device/scanner'], {
                        state: { device: 'Scanner', inventorydetails: res },
                        queryParams: { deviceinventory: true }
                    });
                },
                error: (error: any) => console.error(error)
            });
        } else if (row.tag.includes('PJG-TAB')) {
            this.tabletAuth.getById(row.id).subscribe({
                next: (res: any) => {
                    this.router.navigate(['add-device/tablet'], {
                        state: { device: 'Tablet', inventorydetails: res },
                        queryParams: { deviceinventory: true }
                    });
                },
                error: (error: any) => console.error(error)
            });
        }
    }
}
