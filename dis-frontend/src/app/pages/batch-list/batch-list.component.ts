import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';

import { forkJoin, map } from 'rxjs';

import { MessageService, SortEvent, MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { TableModule, Table } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { Menu } from 'primeng/menu';

import { TableBatch } from '../../utilities/models/TableBatch';
import { Supplier } from '../../utilities/models/Supplier';

import { UtilService } from '../../utilities/services/util.service';

import { BatchComponent } from '../../forms/batch/batch.component';
import { SupplierComponent } from '../../forms/supplier/supplier.component';

import { Column } from '../../common';

@Component({
    selector: 'app-batch-list',
    imports: [
        TableModule,
        IconFieldModule,
        InputTextModule,
        InputIconModule,
        ButtonModule,
        ToastModule,
        Menu,
        Dialog,
        CommonModule,
        BatchComponent,
        SupplierComponent,
        RouterOutlet
    ],
    providers: [
        MessageService
    ],
    templateUrl: './batch-list.component.html',
    styleUrl: './batch-list.component.scss'
})
export class BatchListComponent implements OnInit {
    @ViewChild('dataTable') dataTable!: Table;
    @ViewChild('menuRef') menuRef!: Menu;

    activeBatch: any;
    dataSource!: TableBatch[];
    initialValue!: TableBatch[];
    selectedBatch!: TableBatch;
    columns: Column[] | undefined;
    batchMenu: MenuItem[] | undefined;

    isSorted: boolean | null = null;

    first: number = 0;
    rows: number = 10;
    visible: boolean = false;

    utilAuth = inject(UtilService);
    notification = inject(MessageService);
    router = inject(Router);

    isCreatingBatch = signal(true);
    isBatchAdded = signal(false);

    constructor() {
        this.batchMenu = [
            {
                label: 'Options',
                items: [
                    {
                        label: 'View Details',
                        icon: 'pi pi-eye',
                        command: () => this.viewDetailsOption(this.activeBatch)
                    },
                    {
                        label: 'Edit Batch',
                        icon: 'pi pi-pen-to-square',
                        command: () => this.editBatchOption(this.activeBatch)
                    },
                    {
                        label: 'Drop Batch',
                        icon: 'pi pi-trash',
                        command: () => this.dropBatchOption(this.activeBatch)
                    }
                ]
            }
        ];

        this.columns = [
            { field: 'formattedId', header: 'Batch ID' },
            { field: 'supplier', header: 'Supplier' },
            { field: 'dateDelivered', header: 'Date Delivered' },
            { field: 'validUntil', header: 'Valid Until' }
        ];
    }

    ngOnInit(): void {
        this.utilAuth.getBatches().subscribe({
            next: (res: TableBatch[]) => {
                const batchData = res.map((item: TableBatch) => {
                    return this.utilAuth.getSupplierById(item.supplierId).pipe(
                        map((supplier: Supplier) => ({
                            formattedId: item.formattedId,
                            supplier: supplier.name,
                            dateDelivered: item.dateDelivered,
                            validUntil: item.validUntil
                        }))
                    );
                });

                forkJoin(batchData).subscribe((result: any) => {
                    this.dataSource = result;
                    this.initialValue = [...result];
                });
            },
            error: (error: any) => {
                this.notification.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `${error}`
                });
            }
        });
    }

    //Functions
    customSort(event: SortEvent): void {
        if (this.isSorted == null || this.isSorted === undefined) {
            this.isSorted = true;
            this.sortTableData(event);
        } else if (this.isSorted == true) {
            this.isSorted = false;
            this.sortTableData(event);
        } else if (this.isSorted == false) {
            this.isSorted = null;
            this.dataSource = [...this.initialValue];
            this.dataTable.reset();
        }
    }

    onMenuClick(event: MouseEvent, batch: any) {
        this.activeBatch = batch;
        this.menuRef.toggle(event);
    }

    viewDetailsOption(batch: any): void {
        console.log(batch);
    }

    editBatchOption(batch: any): void {
        console.log(batch);
    }

    dropBatchOption(batch: any): void {
        console.log(batch);
    }

    onGlobalFilter(event: Event): void {
        const inputElement = event.target as HTMLInputElement;

        this.dataTable.filterGlobal(inputElement.value, 'contains');
    }

    pageChange(event: any): void {
        this.first = event.first;
    }

    sortTableData(event: any) {
        event.data?.sort((data1: any, data2: any) => {
            let value1 = data1[event.field];
            let value2 = data2[event.field];
            let result: any;

            if (value1 == null && value2 != null) result = -1;
            else if (value1 != null && value2 == null) result = 1;
            else if (value1 == null && value2 == null) result = 0;
            else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
            else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

            return event.order * result;
        });
    }

    showDialog() {
        this.visible = true;
    }

    closeDialog(event: boolean) {
        this.visible = event;
    }

    updateState = () => this.isCreatingBatch.update(() => !this.isCreatingBatch());
}
