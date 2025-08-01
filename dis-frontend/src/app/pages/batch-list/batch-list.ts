import { Component, OnInit, ChangeDetectorRef, ViewChild, inject, effect, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
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

import { Request } from '../../utilities/services/request';
import { Signal } from '../../utilities/services/signal';

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
    RouterOutlet,
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
  rows: number = 10;
  visible: boolean = false;

  requestAuth = inject(Request);
  signalService = inject(Signal);
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
      { field: 'batch_id', header: 'Batch ID' },
      { field: 'supplier', header: 'Supplier' },
      { field: 'date_delivered', header: 'Date Delivered' },
      { field: 'valid_until', header: 'Valid Until' }
    ];

    effect(() => {
      if (this.signalService.batchSignal()) {
        this.getAllBatch();
        this.signalService.resetBatchFlag();
      }
    });
  }

  ngOnInit(): void {
    this.getAllBatch();
  }

  getAllBatch(): void {
    this.requestAuth.getAllBatches().subscribe({
      next: (res: TableBatchInterface[]) => {
        const batchData = res.map((item: TableBatchInterface) => {
          return this.requestAuth.getSupplierById(item.supplier_id).pipe(
            map((supplier: SupplierInterface) => ({
              id: item.id,
              batch_id: item.batch_id,
              supplier: supplier?.name,
              date_delivered: item.date_delivered,
              valid_until: item.valid_until,
              created_at: item.created_at
            }))
          );
        });

        forkJoin(batchData).subscribe((result: any) => {
          this.dataSource = result;
          this.initialValue = [...result];
          this.cdr.detectChanges();
        });
      },
      error: (error: any) => this.notification.add({
        severity: 'error',
        summary: 'Error',
        detail: `${error}`
      })
    });
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
      this.dataTable.reset();
    }
  }

  onMenuClick(event: MouseEvent, batch: any) {
    this.activeBatch = batch;
    this.menuRef.toggle(event);
  }

  viewDetailsOption(batch: any): void {
    this.requestAuth.getBatchById(batch.id).subscribe({
      next: (res: any) => {
        this.signalService.setBatchDetails(res);
        this.router.navigate(['/batch-list/batch-details']);
      },
      error: (error: any) => {
        this.notification.add({
          severity: 'error',
          summary: 'Error',
          detail: `${error}`
        });
      }
    })
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

  showDialog(): void {
    this.visible = true;
  }

  closeDialog(event: boolean): void {
    this.visible = event;
  }
}
