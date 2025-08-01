import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Signal {
  private supplierDetails = signal<any | null>(null);
  private batchDetails = signal<any | null>(null);

  private supplierAdded = signal<boolean>(false);
  private batchAdded = signal<boolean>(false);
  private deviceAdded = signal<boolean>(false);

  public readonly supplierData = this.supplierDetails.asReadonly();
  public readonly batchData = this.batchDetails.asReadonly();

  public readonly supplierSignal = this.supplierAdded.asReadonly();
  public readonly batchSignal = this.batchAdded.asReadonly();
  public readonly deviceSignal = this.deviceAdded.asReadonly();

  //SET signals
  setSupplierDetails(data: any): void {
    this.supplierDetails.set(data);
  }

  setBatchDetails(data: any): void {
    this.batchDetails.set(data);
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

  //RESET signals
  emptySupplierDetails(): void {
    this.supplierDetails.set(null);
  }

  emptyBatchDetails(): void {
    this.batchDetails.set(null);
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
