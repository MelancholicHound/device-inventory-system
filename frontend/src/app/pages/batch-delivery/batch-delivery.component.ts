import { Component, AfterViewInit, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { BatchComponent } from '../../forms/batch/batch.component';
import { SupplierComponent } from '../../forms/supplier/supplier.component';

interface TableBatch {
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
        NgIf,
        BatchComponent,
        SupplierComponent
    ],
    templateUrl: './batch-delivery.component.html',
    styleUrl: './batch-delivery.component.scss'
})

export class BatchDeliveryComponent implements AfterViewInit, OnInit, OnDestroy {
    displayedColumns: string[] = ["formattedId", "supplier", "dateDelivered", "validUntil", "settings"];
    batchDataSource!: MatTableDataSource<TableBatch>; fetchedData!: any[];

    toggleBatchForm: boolean = true; toggleSupplierForm: boolean = false;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(private router: Router) {
        this.batchDataSource = new MatTableDataSource(this.fetchedData);
    }

    ngAfterViewInit(): void {
        this.batchDataSource.paginator = this.paginator;
        this.batchDataSource.sort = this.sort;
    }

    ngOnInit(): void {
        var addBatchModal = document.getElementById('add-batch') as HTMLDivElement;
        var openModal = document.getElementById('open-add-batch') as HTMLButtonElement;
        var closeModal = document.getElementById('close-add-batch') as HTMLButtonElement;

        openModal.onclick = function() {
            addBatchModal.style.display = 'block';
        }

        closeModal.onclick = function() {
            addBatchModal.style.display = 'none';
        }
    }

    ngOnDestroy(): void {

    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.batchDataSource.filter = filterValue.trim().toLowerCase();

        if (this.batchDataSource.paginator) {
            this.batchDataSource.paginator.firstPage();
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
            var closeModal = document.getElementById('close-add-batch') as HTMLButtonElement;
            closeModal.click();
            this.router.navigate(['add-batch'], { queryParams: { branch: new Date().getTime() } });
        }
    }
}
