import { Component, AfterViewInit, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { forkJoin, map } from 'rxjs';

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

    constructor(private aioAuth: DeviceAioService,
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
            this.aioAuth.getAllDevice().pipe(
                map((data: any[]) => this.mapData(data))
            ),
            this.computerAuth.getAllDevice().pipe(
                map((data: any[]) => this.mapData(data))
            ),
            this.laptopAuth.getAllDevice().pipe(
                map((data: any[]) => this.mapData(data))
            ),
            this.printerAuth.getAllDevice().pipe(
                map((data: any[]) => this.mapData(data))
            ),
            this.routerAuth.getAllDevice().pipe(
                map((data: any[]) => this.mapData(data))
            ),
            this.scannerAuth.getAllDevice().pipe(
                map((data: any[]) => this.mapData(data))
            ),
            this.serverAuth.getAllDevice().pipe(
                map((data: any[]) => this.mapData(data))
            ),
            this.tabletAuth.getAllDevice().pipe(
                map((data: any[]) => this.mapData(data))
            )
        ]).subscribe({
            next: (result: any[]) => {
                this.fetchedData = [
                    ...result[0], ...result[1],
                    ...result[2], ...result[3],
                    ...result[4], ...result[5],
                    ...result[6], ...result[7]
                ];
                this.dataSource.data = this.fetchedData;
            }
        })
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }


    mapData(data: any[]) {
        return data.map((item) => ({
            tag: item.tag,
            division: item.sectionDTO.divisionId,
            section: item.sectionDTO.name,
            status: item.condemnedDTO
        }))
    }
}
