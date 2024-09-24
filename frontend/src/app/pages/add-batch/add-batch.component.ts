import { Component, AfterViewInit, ViewChild, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { NgFor } from '@angular/common';
import { Router } from '@angular/router';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { ParamsService } from '../../util/services/params.service';

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
        ParamsService
    ],
    templateUrl: './add-batch.component.html',
    styleUrl: './add-batch.component.scss'
})
export class AddBatchComponent implements AfterViewInit, OnInit, OnDestroy {
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
    fetchedData: any; deviceSelected: any;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    @ViewChild('addDeviceModal') addDeviceModal!: ElementRef;

    constructor(private router: Router,
                private _params: ParamsService) { this.dataSource = new MatTableDataSource(this.fetchedData); }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    ngOnInit(): void {
        this._params.getBatchDetails(localStorage.getItem('batchcount')).subscribe((data: any) => { this.batchDetails = data });
    }


    ngOnDestroy(): void {
        localStorage.removeItem('batchcount');
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

    backButton() { this.router.navigate(['/batch-delivery'], { queryParams: { main: new Date().getTime() } }) }

    openAddDeviceModal() { this.addDeviceModal.nativeElement.style.display = 'block' }

    closeAddDeviceModal() { this.addDeviceModal.nativeElement.style.display = 'none' }
}
