import { Component, OnInit, ChangeDetectorRef, ViewChild, inject, effect, signal } from '@angular/core';

import { MessageService, ConfirmationService, SortEvent, MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { TableModule, Table } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { Menu } from 'primeng/menu';

import { Requestservice } from '../../utilities/services/requestservice';
import { Signalservice } from '../../utilities/services/signalservice';

import { TableSupplierInterface } from '../../utilities/models/TableSupplierInterface';

import { TableUtilities } from '../../utilities/modules/common';

import { Supplier } from '../../forms/supplier/supplier';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-supplier-list',
  imports: [
    TableModule,
    IconFieldModule,
    ConfirmDialog,
    InputTextModule,
    InputIconModule,
    ButtonModule,
    Menu,
    Dialog,
    Supplier
  ],
  templateUrl: './supplier-list.html',
  styleUrl: './supplier-list.css'
})
export class SupplierList implements OnInit {
  @ViewChild('supplierTable') supplierTable!: Table;
  @ViewChild('menuRef') menuRef!: Menu;

  activeSupplier: any;
  activeEvent: Event | undefined;

  dataSource!: TableSupplierInterface[];
  initialValue!: TableSupplierInterface[];
  selectedSupplier!: TableSupplierInterface;

  columns: Column[] | undefined;
  supplierMenu: MenuItem[] | undefined;

  isSorted: boolean | null = null;

  first: number = 0;
  rows: number = 5;
  visible: boolean = false;

  requestAuth = inject(Requestservice);
  signalService = inject(Signalservice);
  notification = inject(MessageService);
  confirmation = inject(ConfirmationService);

  isSupplierAdded = signal(false);

  tblUtilities = new TableUtilities();

  constructor(private cdr: ChangeDetectorRef) {
    this.columns = [
      { field: 'name', header: 'Supplier Name' },
      { field: 'location', header: 'Supplier Location' },
      { field: 'contact_number', header: 'Contact Number' },
      { field: 'cp_name', header: 'Contact Person' }
    ];

    effect(() => {
      if (this.signalService.supplierSignal()) {
        this.getAllSuppliers();
        this.signalService.resetSupplierFlag();
      }
    });
  }

  ngOnInit(): void {
    this.getAllSuppliers();
  }

  getAllSuppliers(): void {
    this.requestAuth.getAllSuppliers().subscribe({
      next: (res: any) => {
        this.dataSource = res;
        this.initialValue = [...res];
        this.cdr.detectChanges();
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

  customSort(event: SortEvent): void {
    if (this.isSorted == null || this.isSorted === undefined) {
      this.isSorted = true;
      this.tblUtilities.sortTableData(event);
    } else if (this.isSorted == true) {
      this.isSorted = false;
      this.tblUtilities.sortTableData(event);
    } else if (this.isSorted == false) {
      this.isSorted = null;
      this.dataSource = [...this.initialValue];
      this.supplierTable.reset();
    }
  }

  onMenuClick(event: MouseEvent, supplier: any): void {
    this.activeSupplier = supplier;
    this.activeEvent = event;
    this.getSupplierMenu();
  }

  getSupplierMenu(): void {
    this.supplierMenu = [
      {
        label: 'Options',
        items: [
          {
            label: 'Supplier Details',
            icon: 'pi pi-eye',
            command: () => this.viewSupplierOption(this.activeSupplier)
          },
          {
            label: 'Delete Supplier',
            icon: 'pi pi-trash',
            command: () => this.dropSupplierOption(this.activeEvent!, this.activeSupplier)
          }
        ]
      }
    ]
  }

  viewSupplierOption(supplier: any): void {
    this.showDialog();

    this.requestAuth.getSupplierById(supplier.id).subscribe({
      next: (res: any) => {
        this.signalService.supplierDetails.set(res);
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

  dropSupplierOption(event: Event, supplier: any): void {
    this.confirmation.confirm({
      target: event.currentTarget as HTMLInputElement,
      message: 'This action will delete this supplier. Continue?',
      header: 'Confirmation',
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-contrast',
      accept: () => {
        this.requestAuth.deleteSupplier(supplier.id).subscribe({
          next: (res: any) => {
            this.notification.add({
              severity: 'success',
              summary: 'Success',
              detail: `${res.message}`
            });

            this.signalService.markSupplierAsAdded();
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
    });
  }

  onGlobalFilter(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    this.supplierTable.filterGlobal(inputElement.value, 'contains');
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
