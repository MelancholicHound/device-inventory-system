import { Component, OnInit, ChangeDetectorRef, ViewChild, inject, effect, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { forkJoin, map } from 'rxjs';

import { MessageService, SortEvent, MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { TableModule, Table } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { Menu } from 'primeng/menu';

import { Requestservice } from '../../utilities/services/requestservice';
import { Signalservice } from '../../utilities/services/signalservice';

import { SupplierInterface } from '../../utilities/models/SupplierInterface';
import { TableBatchInterface } from '../../utilities/models/TableBatchInterface';

import { TableUtilities } from '../../utilities/modules/common';

import { Batch } from '../../forms/batch/batch';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-batch-list',
  imports: [
    CommonModule,
    TableModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    ButtonModule,
    Menu,
    Dialog,
    Batch
  ],
  templateUrl: './batch-list.html',
  styleUrl: './batch-list.css'
})
export class BatchList implements OnInit {
  @ViewChild('dataTable') dataTable!: Table;
  @ViewChild('menuRef') menuRef!: Menu;

  activeBatch: any;

  dataSource!: TableBatchInterface[];
  initialValue!: TableBatchInterface[];
  selectedBatch!: TableBatchInterface;

  columns: Column[] | undefined;
  batchMenu: MenuItem[] | undefined;

  isSorted: boolean | null = null;

  first: number = 0;
  rows: number = 5;
  visible: boolean = false;

  requestAuth = inject(Requestservice);
  signalService = inject(Signalservice);
  notification = inject(MessageService);
  router = inject(Router);

  isBatchAdded = signal(false);

  tblUtilities = new TableUtilities();

  constructor(private cdr: ChangeDetectorRef) {
    this.batchMenu = [
      {
        label: 'Options',
        items: [
          {
            label: 'View Batch',
            icon: 'pi pi-eye',
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
      { field: 'batch_id', header: 'Batch ID' },
      { field: 'supplier', header: 'Supplier' },
      { field: 'date_delivered', header: 'Date Delivered' },
      { field: 'valid_until', header: 'Valid Until' }
    ];

    effect(() => {
      if (this.signalService.batchSignal()) {
        this.signalService.loadToTableBatch();
        this.signalService.resetBatchFlag();
      }

      this.dataSource = [...this.signalService.tableBatchList()];
      this.initialValue = [...this.signalService.tableBatchList()];
    });
  }

  ngOnInit(): void {
    this.signalService.loadToTableBatch();
  }

  get batches() {
    return this.signalService.tableBatchList();
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
      if (this.dataTable) {
        this.dataTable.reset();
      }
    }
  }

  onMenuClick(event: MouseEvent, batch: any) {
    this.activeBatch = batch;
    this.menuRef.toggle(event);
  }

  editBatchOption(batch: any): void {
    this.requestAuth.getBatchById(batch.id).subscribe({
      next: (res: any) => {
        this.signalService.batchDetails.set(res);
        this.router.navigate(['/batch-list/batch-details'], {
          queryParams: { isEditing: true }
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

  dropBatchOption(batch: any): void {
    console.log(batch);
  }

  onGlobalFilter(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    this.dataTable.filterGlobal(inputElement.value, 'contains');
  }

  pageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
  }

  showDialog(): void {
    this.visible = true;
  }

  closeDialog(event: boolean): void {
    this.visible = event;
  }
}
