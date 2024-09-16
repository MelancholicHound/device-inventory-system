import { Component, AfterViewInit, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { BatchComponent } from '../../forms/batch/batch.component';
import { SupplierComponent } from '../../forms/supplier/supplier.component';

export interface BatchTable {
    formattedId: string;
    supplier: string;
    dateDelivered: string;
    validUntil: string;
}

@Component({
    selector: 'app-batch-delivery',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        NgIf, NgFor,
        BatchComponent,
        SupplierComponent
    ],
    templateUrl: './batch-delivery.component.html',
    styleUrl: './batch-delivery.component.scss'
})

export class BatchDeliveryComponent implements AfterViewInit, OnInit, OnDestroy {
    displayedColumns: string[] = ['formattedId', 'supplier', 'dateDelivered', 'validUntil', 'settings'];
    dataSource!: MatTableDataSource<BatchTable>; fetchedData!: any;

    toggleBatchForm: boolean = true; toggleSupplierForm: boolean = false;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(private _router: Router) {
        this.dataSource = new MatTableDataSource(this.fetchedData);
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    ngOnInit(): void {
        var modal = document.getElementById('add-batch') as HTMLDivElement;
        var openModal = document.querySelector('.open-add-btn') as HTMLButtonElement;
        var closeModal = document.querySelector('.close-add-batch') as HTMLButtonElement;

        openModal.onclick = function() {
            modal.style.display = 'block';
        }

        closeModal.onclick = function() {
            modal.style.display = 'none';
        }
    }

    ngOnDestroy(): void {

    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    toggleBatch(value: boolean): void {
        this.toggleBatchForm = value;
        this.toggleSupplierForm = !value;
    }

    toggleSupplier(value: boolean): void {
        this.toggleBatchForm = !value;
        this.toggleSupplierForm = value;
    }

    isAdding(item: boolean) {
        if (item) {
            var closeModal = document.querySelector('.close-add-batch') as HTMLButtonElement;
            closeModal.click();
            this._router.navigate(['add-batch'], { queryParams: { main : new Date().getTime() } });
        }
    }
}
