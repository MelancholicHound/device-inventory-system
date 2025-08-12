import { Injectable, signal, inject } from '@angular/core';

import { forkJoin, map, Observable, of, switchMap } from 'rxjs';

import { MessageService } from 'primeng/api';

import { TableBatchInterface } from '../models/TableBatchInterface';
import { TableSupplierInterface } from '../models/TableSupplierInterface';
import { SupplierInterface } from '../models/SupplierInterface';

import { Requestservice } from './requestservice';

@Injectable({
  providedIn: 'root'
})
export class Signalservice {
  requestAuth = inject(Requestservice);
  notification = inject(MessageService);

  supplierDetails = signal<any | null>(null);
  batchDetails = signal<any | null>(null);
  deviceDetails = signal<any | null>(null);

  batchDeviceCount = signal<number | null>(null);

  private supplierAdded = signal<boolean>(false);
  private batchAdded = signal<boolean>(false);
  private deviceAdded = signal<boolean>(false);

  divisions = signal<any[]>([]);
  procBrand = signal<any[]>([]);
  ram = signal<any[]>([]);
  storage = signal<any[]>([]);
  gpu = signal<any[]>([]);
  connections = signal<any[]>([]);
  peripherals = signal<any[]>([]);
  os = signal<any[]>([]);
  productivityTools = signal<any[]>([]);
  security = signal<any[]>([]);
  storageType = signal<any[]>([]);

  batchList = signal<any[]>([]);
  supplierList = signal<any[]>([]);

  tableBatchList = signal<TableBatchInterface[]>([]);
  tableSupplierList = signal<TableSupplierInterface[]>([]);

  public readonly supplierSignal = this.supplierAdded.asReadonly();
  public readonly batchSignal = this.batchAdded.asReadonly();
  public readonly deviceSignal = this.deviceAdded.asReadonly();

  constructor() {
    this.requestAuth.getAllBatches().subscribe(
      (res: any) => this.batchList.set(res)
    );
    this.requestAuth.getAllSuppliers().subscribe(
      (res: any) => this.supplierList.set(res)
    );
    this.requestAuth.getDivisions().subscribe(
      (res: any) => this.divisions.set(res)
    );
    this.requestAuth.getAllProcessorBrand().subscribe(
      (res: any) => this.procBrand.set(res)
    );
    this.requestAuth.getAllRAMCapacities().subscribe(
      (res: any) => this.ram.set(res)
    );
    this.requestAuth.getAllStorageCapacities().subscribe(
      (res: any) => this.storage.set(res)
    );
    this.requestAuth.getAllGPUCapacities().subscribe(
      (res: any) => this.gpu.set(res)
    );
    this.requestAuth.getAllConnections().subscribe(
      (res: any) => this.connections.set(res)
    );
    this.requestAuth.getAllPeripherals().subscribe(
      (res: any) => this.peripherals.set(res)
    );
    this.requestAuth.getAllSoftwareOS().subscribe(
      (res: any) => this.os.set(res)
    );
    this.requestAuth.getAllSoftwareProdTool().subscribe(
      (res: any) => this.productivityTools.set(res)
    );
    this.requestAuth.getAllSoftwareSecurity().subscribe(
      (res: any) => this.security.set(res)
    );
    this.requestAuth.getStorageType().subscribe(
      (res: any) => this.storageType.set(res)
    );
  }

  markSupplierAsAdded(): void {
    this.supplierAdded.set(true);
  }

  markBatchAsAdded(): void {
    this.batchAdded.set(true);
  }

  markDeviceAsAdded(): void {
    this.deviceAdded.set(true);
  }

  resetSupplierFlag(): void {
    this.supplierAdded.set(false);
  }

  resetBatchFlag(): void {
    this.batchAdded.set(false);
  }

  resetDeviceFlag(): void {
    this.deviceAdded.set(false);
  }

  loadToTableBatch(): void {
    this.requestAuth.getAllBatches().pipe(
      switchMap((batches: TableBatchInterface[]) => {
        if (!batches.length) return of([]);
        const batchData$: Observable<{
          id: number;
          batch_id: string;
          supplier: string;
          date_delivered: string;
          valid_until: string;
          created_at: string;
        }>[] = batches.map((batch: any) =>
          this.requestAuth.getSupplierById(batch.supplier_id).pipe(
            map((supplier: SupplierInterface) => ({
              id: batch.id,
              batch_id: batch.batch_id,
              supplier: supplier?.name,
              date_delivered: batch.date_delivered,
              valid_until: batch.valid_until,
              created_at: batch.created_at
            }))
          )
        );

        return forkJoin(batchData$);
      })
    ).subscribe({
      next: (res: any) => this.tableBatchList.set(res),
      error: (error: any) => console.error(error)
    });
  }

  loadToTableSupplier(): void {
    this.requestAuth.getAllSuppliers().subscribe({
      next: (res: any) => {
        const filteredSuppliers = res.map((item: any) => ({
          id: item.id,
          name: item.name,
          location: item.location,
          contact_number: item.contact_number,
          cp_name: item.cp_name,
          created_at: new Date(item.created_at)
        }));

        this.tableSupplierList.set(filteredSuppliers);
      }
    });
  }

  reinitializeBatch(): void {
    this.requestAuth.getAllBatches().subscribe(
      (res: any) => this.batchList.set(res)
    );
  }

  reinitializeSupplier(): void {
    this.requestAuth.getAllSuppliers().subscribe(
      (res: any) => this.supplierList.set(res)
    );
  }

  reinitializeRAM(): void {
    this.requestAuth.getAllRAMCapacities().subscribe(
      (res: any) => this.ram.set(res)
    );
  }

  reinitializeStorage(): void {
    this.requestAuth.getAllStorageCapacities().subscribe(
      (res: any) => this.storage.set(res)
    );
  }

  reinitializeGPU(): void {
    this.requestAuth.getAllGPUCapacities().subscribe(
      (res: any) => this.gpu.set(res)
    );
  }

  reinitializeConnections(): void {
    this.requestAuth.getAllConnections().subscribe(
      (res: any) => this.connections.set(res)
    );
  }

  reinitializePeripherals(): void {
    this.requestAuth.getAllPeripherals().subscribe(
      (res: any) => this.peripherals.set(res)
    );
  }

  reinitializeOS(): void {
    this.requestAuth.getAllSoftwareOS().subscribe(
      (res: any) => this.os.set(res)
    );
  }

  reinitializeProdTool(): void {
    this.requestAuth.getAllSoftwareProdTool().subscribe(
      (res: any) => this.productivityTools.set(res)
    );
  }

  reinitializeSecurity(): void {
    this.requestAuth.getAllSoftwareSecurity().subscribe(
      (res: any) => this.security.set(res)
    );
  }
}
