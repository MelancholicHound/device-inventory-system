import { Component, AfterViewInit, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

interface DeviceTable {
    formattedId: string;
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
        MatPaginatorModule
    ],
    templateUrl: './computer-inventory.component.html',
    styleUrl: './computer-inventory.component.scss'
})
export class ComputerInventoryComponent implements AfterViewInit, OnInit, OnDestroy {
    displayedColumns: string[] = ['formattedId', 'supplier', 'division', 'section', 'settings'];
    inventoryDataSource!: MatTableDataSource<DeviceTable>; fetchedData!: any;
    devices: any[] = [
        { name: 'Computer', indicator: 'computer' },
        { name: 'Laptop', indicator: 'laptop' },
        { name: 'Tablet', indicator: 'tablet' },
        { name: 'Printer', indicator: 'printer' },
        { name: 'Router', indicator: 'router' },
        { name: 'Scanner', indicator: 'scanner' },
        { name: 'AIO', indicator: 'aio' }
    ];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(private router: Router) {
        this.inventoryDataSource = new MatTableDataSource(this.fetchedData);
    }

    ngAfterViewInit(): void {
        this.inventoryDataSource.paginator = this.paginator;
        this.inventoryDataSource.sort = this.sort;
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

    ngOnDestroy(): void {

    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.inventoryDataSource.filter = filterValue.trim().toLowerCase();

        if (this.inventoryDataSource.paginator) {
            this.inventoryDataSource.paginator.firstPage();
        }
    }
}
