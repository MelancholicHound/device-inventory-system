import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

export interface DeviceTable {
    tag: string;
    supplier: string;
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

    fetchedData!: any;

    constructor() {
        this.dataSource = new MatTableDataSource(this.fetchedData);
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    ngOnInit(): void {
        var addDev = document.getElementById('add-device') as HTMLDivElement;
        var filter = document.getElementById('filter') as HTMLDivElement;
        var openAddDev = document.getElementById('add-dev') as HTMLButtonElement;
        var openFilter = document.getElementById('filter-btn') as HTMLButtonElement;
        var closeAddDev = document.querySelector('.close-add-dev') as HTMLButtonElement;
        var closeFilter = document.querySelector('.close-filter') as HTMLButtonElement;

        openAddDev.onclick = function() {
            addDev.style.display = 'block';
        }

        openFilter.onclick = function () {
            filter.style.display = 'block';
        }

        closeAddDev.onclick = function() {
            addDev.style.display = 'none';
        }

        closeFilter.onclick = function() {
            filter.style.display = 'none';
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
