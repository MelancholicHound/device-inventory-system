import { Component, ViewChild, ChangeDetectorRef, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { forkJoin, firstValueFrom, Observable } from 'rxjs';
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
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';

import { Requestservice } from '../../utilities/services/requestservice';
import { Signalservice } from '../../utilities/services/signalservice';

import { TableDeviceInterface } from '../../utilities/models/TableDeviceInterface';

import { TableUtilities } from '../../utilities/modules/common';

import { Batch } from '../../forms/batch/batch';

interface Column {
  field: string;
  header: string;
}

interface Device {
  name: string;
  indicator: string;
}

@Component({
  selector: 'app-batch-details',
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
    Select,
    InputNumber,
    Batch
  ],
  templateUrl: './batch-details.html',
  styleUrl: './batch-details.css'
})
export class BatchDetails {
  @ViewChild('deviceTable') deviceTable!: Table;
  @ViewChild('menuRef') menuRef!: Menu;

  activeDevice: any;
  batchDetails: any;

  dataSource!: TableDeviceInterface[];
  initialValue!: TableDeviceInterface[];
  selectedDevice!: TableDeviceInterface;

  columns: Column[] | undefined;
  devices: Device[] | undefined;
  deviceMenu: MenuItem[] | undefined;

  requestAuth = inject(Requestservice);
  signalService = inject(Signalservice);
  router = inject(Router);
  fb = inject(FormBuilder);
  notification = inject(MessageService);
  confirmation = inject(ConfirmationService);

  isViewing = signal(false);
  isEditing = signal(false);
  isDeviceAdded = signal(false);
  deviceLength = signal(0);

  isSorted: boolean | null = null;

  first: number = 0;
  rows: number = 5;
  visibleBatchDetails: boolean = false;
  visibleAddDevice: boolean = false;

  tblUtilities = new TableUtilities();

  addDeviceForm = this.fb.group({
    device: [null, Validators.required],
    quantity: [null, Validators.required]
  });

  constructor(private cdr: ChangeDetectorRef) {
    const navigation = this.router.getCurrentNavigation();

    if (navigation?.extras.queryParams) {
      this.isEditing.set(navigation.extras.queryParams['isEditing']);
    }

    this.deviceMenu = [
      {
        label: 'Options',
        items: [
          {
            label: 'Edit Device',
            icon: 'pi pi-pen-to-square',
            command: () => this.editDeviceOption(this.activeDevice)
          },
          {
            label: 'Delete Device',
            icon: 'pi pi-trash',
            command: () => this.dropDeviceOption(this.activeDevice)
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

    this.devices = [
      { name: 'Computer', indicator: 'computer' },
      { name: 'Laptop', indicator: 'laptop' },
      { name: 'Tablet', indicator: 'tablet' },
      { name: 'Printer', indicator: 'printer' },
      { name: 'Router', indicator: 'router' },
      { name: 'Scanner', indicator: 'scanner' },
      { name: 'AIO', indicator: 'aio' },
      { name: 'UPS', indicator: 'ups' }
    ];

    effect(() => {
      if (this.signalService.batchDetails()) {
        this.batchDetails = this.signalService.batchDetails();
        this.getAllDevicesByBatchId(this.batchDetails.id);
      }

      if (this.signalService.deviceDetails()) {
        this.getAllDevicesByBatchId(this.batchDetails.id);
        this.signalService.deviceDetails.set([]);
      }
    });
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

  getAllDevicesByBatchId(id: number) {
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
        const rawFetchedData = res.flat();
        this.dataSource = rawFetchedData;
        this.initialValue = [...rawFetchedData];
        this.signalService.batchDeviceCount.set(rawFetchedData.length);
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
    const fetchMethods: { [key: string]: (id: number) => Observable<any> } = {
      AIO: this.requestAuth.getAIOById.bind(this.requestAuth),
      COMPUTER: this.requestAuth.getComputerById.bind(this.requestAuth),
      LAPTOP: this.requestAuth.getLaptopById.bind(this.requestAuth),
      TABLET: this.requestAuth.getTabletById.bind(this.requestAuth),
      ROUTER: this.requestAuth.getRouterById.bind(this.requestAuth),
      PRINTER: this.requestAuth.getPrinterById.bind(this.requestAuth),
      SCANNER: this.requestAuth.getScannerById.bind(this.requestAuth)
    };

    const fetchFn = fetchMethods[device.device];

    if (typeof fetchFn === 'function') {
      fetchFn(device.id).subscribe({
        next: (res: any) => {
          this.signalService.deviceDetails.set(res);
        },
        error: (error: any) => {
          this.notification.add({
            severity: 'error',
            summary: 'Error',
            detail: `${error}`
          });
        }
      });
    } else {
      this.notification.add({
        severity: 'warn',
        summary: 'Unknown Device Type',
        detail: `Device type "${device.device}" is not supported.`
      });
    }
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
        this.requestAuth.deleteBatch(this.batchDetails.id).subscribe({
          next: () => {
            this.router.navigate(['/batch-list']);
            this.signalService.resetBatchFlag();
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
    });
  }

  closeDialog(event: boolean): void {
    this.visibleBatchDetails = event;
  }

  resetOnHide(): void {
    this.addDeviceForm.reset();
  }

  backButton(): void {
    this.router.navigate(['/batch-list']);
    this.signalService.batchDetails.set([]);
  }

  saveButton(): void {
    this.signalService.batchDetails.set([]);
    this.router.navigate(['/batch-list']);
    this.notification.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Batch saved successfully'
    });
  }

  addDevice(): void {
    this.router.navigate([`/batch-list/batch-details/device/${this.addDeviceForm.value.device}`], {
      state: { count: this.addDeviceForm.value.quantity }
    });
  }
}
