import { Injectable, signal, inject } from '@angular/core';

import { Request } from './request';

@Injectable({
  providedIn: 'root'
})
export class Signal {
  requestAuth = inject(Request);

  private supplierDetails = signal<any | null>(null);
  private batchDetails = signal<any | null>(null);
  private deviceDetails = signal<any | null>(null);

  private batchDeviceCount = signal<number | null>(null);

  private supplierAdded = signal<boolean>(false);
  private batchAdded = signal<boolean>(false);
  private deviceAdded = signal<boolean>(false);

  division = signal([]);

  procbrand = signal([]);

  ram = signal([]);
  storage = signal([]);
  storagetype = signal([]);
  gpu = signal([]);

  connections = signal([]);
  peripherals = signal([]);
  os = signal([]);
  productivitytools = signal([]);
  security = signal([]);

  public readonly supplierData = this.supplierDetails.asReadonly();
  public readonly batchData = this.batchDetails.asReadonly();
  public readonly deviceData = this.deviceDetails.asReadonly();

  public readonly deviceCount = this.batchDeviceCount.asReadonly();

  public readonly supplierSignal = this.supplierAdded.asReadonly();
  public readonly batchSignal = this.batchAdded.asReadonly();
  public readonly deviceSignal = this.deviceAdded.asReadonly();

  constructor() {
    this.requestAuth.getDivisions().subscribe((res: any) => this.division.set(res));
    this.requestAuth.getAllProcessorBrand().subscribe((res: any) => this.procbrand.set(res));
    this.requestAuth.getAllRAMCapacities().subscribe((res: any) => this.ram.set(res));
    this.requestAuth.getAllStorageCapacities().subscribe((res: any) => this.storage.set(res));
    this.requestAuth.getAllGPUCapacities().subscribe((res: any) => this.gpu.set(res));
    this.requestAuth.getAllConnections().subscribe((res: any) => this.connections.set(res));
    this.requestAuth.getAllPeripherals().subscribe((res: any) => this.peripherals.set(res));
    this.requestAuth.getAllSoftwareOS().subscribe((res: any) => this.os.set(res));
    this.requestAuth.getAllSoftwareProdTool().subscribe((res: any) => this.productivitytools.set(res));
    this.requestAuth.getAllSoftwareSecurity().subscribe((res: any) => this.security.set(res));
    this.requestAuth.getStorageType().subscribe((res: any) => this.storagetype.set(res));
  }

  //SET signals
  setSupplierDetails(data: any): void {
    this.supplierDetails.set(data);
  }

  setBatchDetails(data: any): void {
    this.batchDetails.set(data);
  }

  setDeviceDetails(data: any): void {
    this.deviceDetails.set(data);
  }

  setDeviceCount(count: number): void {
    this.batchDeviceCount.set(count);
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

  //Re-initialization
  reinitializeRAM(): void {
    this.requestAuth.getAllRAMCapacities().subscribe((res: any) => this.ram.set(res));
  }

  reinitializeStorage(): void {
    this.requestAuth.getAllStorageCapacities().subscribe((res: any) => this.storage.set(res));
  }

  reinitializeGPU(): void {
    this.requestAuth.getAllGPUCapacities().subscribe((res: any) => this.gpu.set(res));
  }

  reinitializeConnections(): void {
    this.requestAuth.getAllConnections().subscribe((res: any) => this.connections.set(res));
  }

  reinitializePeripherals(): void {
    this.requestAuth.getAllPeripherals().subscribe((res: any) => this.peripherals.set(res));
  }

  reinitializeOS(): void {
    this.requestAuth.getAllSoftwareOS().subscribe((res: any) => this.os.set(res));
  }

  reinitializeProdTool(): void {
    this.requestAuth.getAllSoftwareProdTool().subscribe((res: any) => this.productivitytools.set(res));
  }

  reinitializeSecurity(): void {
    this.requestAuth.getAllSoftwareSecurity().subscribe((res: any) => this.security.set(res));
  }

  //RESET signals
  emptySupplierDetails(): void {
    this.supplierDetails.set(null);
  }

  emptyBatchDetails(): void {
    this.batchDetails.set(null);
  }

  emptyDeviceDetails(): void {
    this.deviceDetails.set(null);
  }

  emptyDeviceCount(): void {
    this.batchDeviceCount.set(null);
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
}
