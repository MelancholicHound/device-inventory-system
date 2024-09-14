import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { Router } from '@angular/router';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

export interface DeviceTable {
    tag: string;
    device: string;
    division: string;
    section: string;
}

@Component({
    selector: 'app-computer-inventory',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        NgFor
    ],
    templateUrl: './computer-inventory.component.html',
    styleUrl: './computer-inventory.component.scss'
})
export class ComputerInventoryComponent implements AfterViewInit, OnInit {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    displayedColumns: string[] = ['formattedId', 'supplier', 'division', 'section', 'settings'];
    dataSource!: MatTableDataSource<DeviceTable>; fetchedData!: any;
    devices: any[] = [
        { name: 'Computer', indicator: 'computer' },
        { name: 'Laptop', indicator: 'laptop' },
        { name: 'Tablet', indicator: 'tablet' },
        { name: 'Printer', indicator: 'printer' },
        { name: 'Router', indicator: 'router' },
        { name: 'Scanner', indicator: 'scanner' },
        { name: 'AIO', indicator: 'aio' }
    ];

    constructor(private router: Router) {
        this.dataSource = new MatTableDataSource(this.fetchedData);
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    ngOnInit(): void {
        var addDevModal = document.getElementById('add-device') as HTMLDivElement;
        var filterModal = document.getElementById('filter') as HTMLDivElement;
        var openAddDev = document.getElementById('open-add-dev-btn') as HTMLButtonElement;
        var closeAddDev = document.getElementById('close-add-dev-btn') as HTMLButtonElement;
        var openFilter = document.getElementById('open-filter-btn') as HTMLButtonElement;
        var closeFilter = document.getElementById('close-filter-btn') as HTMLButtonElement;

        openAddDev.onclick = function() {
            addDevModal.style.display = 'block';
        }

        closeAddDev.onclick = function() {
            addDevModal.style.display = 'none';
        }

        openFilter.onclick = function() {
            filterModal.style.display = 'block';
        }

        closeFilter.onclick = function() {
            filterModal.style.display = 'none';
        }
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }
}
