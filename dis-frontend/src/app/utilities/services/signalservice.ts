import { Injectable, signal, inject } from '@angular/core';

import { Requestservice } from './requestservice';

@Injectable({
  providedIn: 'root'
})
export class Signalservice {
  requestAuth = inject(Requestservice);

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
