import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { Router } from '@angular/router';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

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

    fetchedData!: any; deviceSelected!: any;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(private router: Router) {
        this.dataSource = new MatTableDataSource(this.fetchedData);
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    ngOnInit(): void {
        var modal = document.getElementById('add-dev') as HTMLDivElement;
        var openModal = document.getElementById('open-add-dev') as HTMLButtonElement;
        var closeModal = document.getElementById('close-add-dev') as HTMLButtonElement;

        openModal.onclick = function() {
            modal.style.display = 'block';
        }

        closeModal.onclick = function() {
            modal.style.display = 'none';
        }
    }


    routeSelectedDevice() {
        var selected = document.getElementById('device') as HTMLSelectElement;
        let count = document.getElementById('count') as HTMLInputElement;
        for (let i = 0; i < this.devices.length; i++) {
            if (selected.value === this.devices[i].name) {
                this.router.navigate([`/add-device/${this.devices[i].indicator}`], { queryParams: { branch: new Date().getTime() } });
                localStorage.setItem('device', this.devices[i].name);
                localStorage.setItem('count', count.value);
            }
        }
    }

    backButton() {
        const toBatchDelivery = document.getElementById('batch-delivery') as HTMLAnchorElement;
        toBatchDelivery.click();
    }
}
