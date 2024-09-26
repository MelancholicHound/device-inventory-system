import { Component, AfterViewInit, ViewChild, OnInit, ChangeDetectionStrategy, ElementRef } from '@angular/core';
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatMenuModule,
        MatButtonModule,
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
    dataSource!: MatTableDataSource<BatchTable>; fetchedData!: any; counter!: number;;

    toggleBatchForm: boolean = true; toggleSupplierForm: boolean = false;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    @ViewChild('addBatchModal') addBatchModal!: ElementRef;

    constructor(private _router: Router,
                private _params: ParamsService) { this.dataSource = new MatTableDataSource(this.fetchedData); }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    ngOnInit(): void {
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
                this.fetchedData = result;
                this.counter = this.fetchedData.length + 1;
            });
        });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource?.paginator) {
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

    openAddBatchModal() { this.addBatchModal.nativeElement.style.display = 'block' }

    closeAddBatchModal() { this.addBatchModal.nativeElement.style.display = 'none' }

    onClickEdit(row: any) {
        this._params.getAllBatches().subscribe((data: any) => {
            for (let i = 0; i < data.length; i++) {
                if (row.formattedId === data[i].formattedId) {
                    this._router.navigate(['add-batch'], { state: { details: data[i] }, queryParams: { branch: new Date().getTime() } });
                    event?.preventDefault();
                }
            }
        });
    }
}
