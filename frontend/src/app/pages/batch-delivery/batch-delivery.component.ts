import { Component, AfterViewInit, ViewChild, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu'
import { MatButtonModule } from '@angular/material/button';

import { forkJoin, map } from 'rxjs';

import { BatchComponent } from '../../forms/batch/batch.component';
import { SupplierComponent } from '../../forms/supplier/supplier.component';

import { ParamsService } from '../../util/services/params.service';

export interface BatchTable {
    formattedId: string;
    supplierId: number;
    dateDelivered: string;
    validUntil: string;
}

@Component({
    selector: 'app-batch-delivery',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatMenuModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        BatchComponent,
        SupplierComponent
    ],
    providers: [
        ParamsService
    ],
    templateUrl: './batch-delivery.component.html',
    styleUrl: './batch-delivery.component.scss'
})

export class BatchDeliveryComponent implements AfterViewInit, OnInit {
    displayedColumns: string[] = ['formattedId', 'supplier', 'dateDelivered', 'validUntil', 'settings'];
    dataSource!: MatTableDataSource<BatchTable>;

    deleteRow: any;
    fetchedData: any[] = [];
    deleteBatchForm!: FormGroup;

    toggleBatchForm: boolean = true; toggleSupplierForm: boolean = false;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    @ViewChild('addBatchModal') addBatchModal!: ElementRef;
    @ViewChild('deletePrompt') deletePrompt!: ElementRef;

    constructor(private router: Router,
                private _params: ParamsService) {
                this.dataSource = new MatTableDataSource(this.fetchedData);
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    ngOnInit(): void {
        this.deleteBatchForm = this.createDeleteBatchForm();
        this._params.getAllBatches().subscribe((data: BatchTable[]) => {
            const batchData = data.map((item: BatchTable) => {
                return this._params.getSupplierById(item.supplierId).pipe(
                    map((supplierData: any) => ({
                        formattedId: item.formattedId,
                        supplier: supplierData.name,
                        dateDelivered: item.dateDelivered,
                        validUntil: item.validUntil
                    }))
                );
            });

            forkJoin(batchData).subscribe((result: any) => {
                this.dataSource.data = result;
            });
        });
    }

    createDeleteBatchForm(): FormGroup {
        return new FormGroup({ batchId: new FormControl('', [Validators.required]) });
    }

    //DELETE
    deleteBatch(batchId: any) {
        this._params.getAllBatches().subscribe({
            next: (data: any) => {
                for (let i = 0; i < data.length; i++) {
                    if (batchId === data[i].formattedId) {
                        this._params.deleteBatch(data[i].id).subscribe();
                        this.deletePrompt.nativeElement.style.display = 'none';
                        window.location.reload();
                    }
                }
            },
            error: (error: any) => { console.log(error) }
        });
    }

    //Togglers
    toggleBatch(value: boolean): void {
        this.toggleBatchForm = value;
        this.toggleSupplierForm = !value;
    }

    toggleSupplier(value: boolean): void {
        this.toggleBatchForm = !value;
        this.toggleSupplierForm = value;
    }

    //Click events
    onClickView(row: any) {
        this._params.getAllBatches().subscribe({
            next: (data: any) => {
                for (let i = 0; i < data.length; i++) {
                    if (row.formattedId === data[i].formattedId) {
                        this.router.navigate(['/add-batch'], { state: { viewdetails: data[i] } });
                        localStorage.setItem('state', 'VIEW');
                    }
                }
            }
        });
    }

    onClickEdit(row: any) {
        this._params.getAllBatches().subscribe({
            next: (data: any) => {
                for (let i = 0; i < data.length; i++) {
                    if (row.formattedId === data[i].formattedId) {
                        this.router.navigate(['/add-batch'], { state: { editdetails: data[i] } });
                        localStorage.setItem('state', 'EDIT');
                    }
                }
            }, error: (error: any) => { console.log(error) }
        });
    }

    onClickDelete(row: any) {
        this.deleteRow = row;
        this.deletePrompt.nativeElement.style.display = 'block';
    }

    //Other functions
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource?.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    deleteBatchValidator() {
        const batchField = this.deleteBatchForm.get('batchId')?.value;

        return batchField === this.deleteRow?.formattedId;
    }
}
