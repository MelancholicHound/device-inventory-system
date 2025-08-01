import { Component, OnInit, ViewChild, ChangeDetectorRef, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { forkJoin, firstValueFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { MessageService, SortEvent, MenuItem, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputIconModule } from 'primeng/inputicon';
import { TableModule, Table } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { Menu } from 'primeng/menu';

import { Request } from '../../utilities/services/request';
import { Signal } from '../../utilities/services/signal';

import { TableDeviceInterface } from '../../utilities/models/TableDeviceInterface';

import { TableUtilities } from '../../utilities/modules/common';

import { Batch } from '../../forms/batch/batch';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-batch-details',
  imports: [
    CommonModule,
    TableModule,
    IconFieldModule,
    ButtonModule,
    ConfirmDialog,
    InputTextModule,
    InputNumberModule,
    InputIconModule,
    Menu,
    Dialog,
    Batch
  ],
  templateUrl: './batch-details.html',
  styleUrl: './batch-details.css'
})
export class BatchDetails implements OnInit {
  @ViewChild('deviceTable') deviceTable!: Table;
  @ViewChild('menuRef') menuRef!: Menu;

  activeDevice: any;
  batchDetails: any;

  dataSource!: TableDeviceInterface[];
  initialValue!: TableDeviceInterface[];
  selectedDevice!: TableDeviceInterface;

  columns: Column[] | undefined;
  deviceMenu: MenuItem[] | undefined;

  isSorted: boolean | null = null;

  first: number = 0;
  rows: number = 10;
  visibleBatchDetails: boolean = false;
  visibleAddDevice: boolean = false;

  requestAuth = inject(Request);
  signalService = inject(Signal);
  notification = inject(MessageService);
  confirmation = inject(ConfirmationService);

  tblUtilities = new TableUtilities();

  constructor(private cdr: ChangeDetectorRef) {
    this.deviceMenu = [
      {
        label: 'Options',
        items: [
          {
            label: 'Edit Device',
            icon: 'pi pi-pen-to-square'
          },
          {
            label: 'Delete Device',
            icon: 'pi pi-trash'
          }
        ]
      }
    ];

    this.columns = [
      { field: 'device_number', header: 'Device Number' },
      { field: 'device', header: 'Device' },
      { field: 'division', header: 'Division' },
      { field: 'section', header: 'Section' }
    ];

    effect(() => {
      if (this.signalService.batchData()) {
        this.batchDetails = this.signalService.batchData();
        this.signalService.emptyBatchDetails();
      }
    });
  }

  ngOnInit(): void {

  }

  async dataMapper(data: any[], deviceType: string): Promise<any[]> {
    const mappedData = await Promise.all(
      data.map(async (item) => {
        const section = await firstValueFrom(this.requestAuth.getSectionById(item.section_id));
        const division = await firstValueFrom(this.requestAuth.getDivisionById(section.div_id));

        return {
          id: item.id,
          device_number: item.device_number,
          device: deviceType,
          division: division.name,
          section: section.name,
          created_at: item.created_at
        };
      })
    );

    return mappedData;
  }

  getAllDevicesByBatchId(id: number): void {
    forkJoin([
      this.requestAuth.getAllAIOByBatchId(id).pipe(
        switchMap((data: any[]) => this.dataMapper(data, 'AIO'))
      ),
      this.requestAuth.getAllLaptopByBatchId(id).pipe(
        switchMap((data: any[]) => this.dataMapper(data, 'LAPTOP'))
      ),
      this.requestAuth.getAllTabletByBatchId(id).pipe(
        switchMap((data: any[]) => this.dataMapper(data, 'TABLET'))
      ),
      this.requestAuth.getAllComputerByBatchId(id).pipe(
        switchMap((data: any[]) => this.dataMapper(data, 'COMPUTER'))
      ),
      this.requestAuth.getAllRouterByBatchId(id).pipe(
        switchMap((data: any[]) => this.dataMapper(data, 'ROUTER'))
      ),
      this.requestAuth.getAllPrinterByBatchId(id).pipe(
        switchMap((data: any[]) => this.dataMapper(data, 'PRINTER'))
      ),
      this.requestAuth.getAllScannerByBatchId(id).pipe(
        switchMap((data: any[]) => this.dataMapper(data, 'SCANNER'))
      )
    ]).subscribe({
      next: (res: any[]) => {
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
    })
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
      this.deviceTable.reset();
    }
  }

  onMenuClick(event: MouseEvent, batch: any): void {
    this.activeDevice = batch;
    this.menuRef.toggle(event);
  }
  onGlobalFilter(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    this.deviceTable.filterGlobal(inputElement.value, 'contains');
  }

  editDeviceOption(device: any): void {
    console.log(device);
  }

  dropDeviceOption(device: any): void {
    console.log(device);
  }

  pageChange(event: any): void {
    this.first = event.first;
  }

  showBatchDetailsDialog(): void {
    this.visibleBatchDetails = true;
  }

  showAddDeviceDialog(): void {
    this.visibleAddDevice = true;
  }

  deleteConfirmation(event: Event): void {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'This action will delete this batch. Continue?',
      header: 'Confirmation',
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-contrast',
      accept: () => {

      }
    });
  }
}
