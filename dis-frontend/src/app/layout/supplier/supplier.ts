import { Component, Output, EventEmitter, effect, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { ButtonModule } from 'primeng/button';

import { Requestservice } from '../../utilities/services/requestservice';
import { Signalservice } from '../../utilities/services/signalservice';

@Component({
  selector: 'app-supplier',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    InputTextModule,
    KeyFilterModule,
    ButtonModule
  ],
  templateUrl: './supplier.html',
  styleUrl: './supplier.css'
})
export class Supplier {
  @Output() closeModal = new EventEmitter<boolean>(true);

  supplierForm!: FormGroup;

  requestAuth = inject(Requestservice);
  signalService = inject(Signalservice);
  notification = inject(MessageService);

  isEditing = signal(false);
  isAdding = signal(true);

  supplierData = this.signalService.supplierDetails;

  constructor() {
    this.supplierForm = this.createSupplierForm();

    effect(() => {
      if (this.supplierData()) {
        this.supplierForm.patchValue(this.supplierData());
        this.supplierForm.disable();
        this.isEditing.set(true);
        this.isAdding.set(false);
      } else {
        this.supplierForm.reset();
        this.supplierForm.enable();
      }
    });
  }

  get mobileNumControl() {
    return this.supplierForm.get('contact_number');
  }

  get mobileNumContactControl() {
    return this.supplierForm.get('cp_contact_number');
  }

  get emailControl() {
    return this.supplierForm.get('email');
  }

  createSupplierForm(): FormGroup {
    return new FormGroup({
      name: new FormControl<string | null>(null, [Validators.required]),
      contact_number: new FormControl<string | null>(null, [Validators.required]),
      email: new FormControl<string | null>(null, [Validators.required, Validators.email]),
      location: new FormControl<string | null>(null, [Validators.required]),
      cp_name: new FormControl<string | null>(null, [Validators.required]),
      cp_contact_number: new FormControl<string | null>(null, [Validators.required])
    });
  }

  saveSupplier(): void {
    if (this.supplierData()) {
      this.requestAuth.putSupplier(this.supplierForm.value, this.supplierData().id).subscribe({
        next: (res: any) => {
          this.notification.add({
            severity: 'success',
            summary: 'Success',
            detail: `${res.message}`
          });

          this.signalService.markSupplierAsAdded();
          this.emitCloseModal();
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
      this.requestAuth.postSupplier(this.supplierForm.value).subscribe({
        next: (res: any) => {
          this.notification.add({
            severity: 'success',
            summary: 'Success',
            detail: `${res.message}`
          });

          this.signalService.markSupplierAsAdded();
          this.emitCloseModal();
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
  }

  emitCloseModal(): void {
    this.closeModal.emit(false);
    this.supplierForm.reset();
  }

  switchButton(): void {
    this.isEditing.set(false);
    this.isAdding.set(true);
    this.supplierForm.enable();
  }
}
