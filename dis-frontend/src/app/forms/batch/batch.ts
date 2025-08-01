import { Component, OnInit, ChangeDetectorRef, ViewChild, Output, EventEmitter, inject, effect, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { FluidModule } from 'primeng/fluid';
import { Select } from 'primeng/select';
import { Checkbox } from 'primeng/checkbox';

import { Request } from '../../utilities/services/request';
import { Signal } from '../../utilities/services/signal';

import { SupplierInterface } from '../../utilities/models/SupplierInterface';

import { FileConverter } from '../../utilities/modules/common';

@Component({
  selector: 'app-batch',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    InputTextModule,
    ButtonModule,
    DatePickerModule,
    FluidModule,
    Select,
    Checkbox
  ],
  templateUrl: './batch.html',
  styleUrl: './batch.css'
})
export class Batch implements OnInit {
  @Output() closeModal = new EventEmitter<boolean>(true);

  @ViewChild('fileInput') fileInput!: HTMLInputElement;

  batchDetails: any;

  batchForm!: FormGroup;

  fileUpload: File | null = null;

  requestAuth = inject(Request);
  signalService = inject(Signal);
  notification = inject(MessageService);
  router = inject(Router);

  selectedFile = signal('');
  suppliers = signal<SupplierInterface[]>([]);

  fileConverter = new FileConverter();

  constructor(private cdr: ChangeDetectorRef) {
    this.batchForm = this.createBatchForm();

    effect(() => {  });
  }

  ngOnInit(): void {
    this.getAllSuppliers();

    this.batchForm.get('date_delivered')?.valueChanges.subscribe(
      (startDate: any) => {
        if (startDate) {
          const nextYearDate = this.addOneYear(new Date(startDate));
          this.batchForm.get('valid_until')?.setValue(nextYearDate);
        }
      }
    );

    const isTested = this.batchForm.get('is_tested')?.value;

    if (!isTested) {
      this.testedDateControl?.disable();
      this.testedDateControl?.clearValidators();
      this.testedDateControl?.updateValueAndValidity();
    }

    this.batchForm.get('is_tested')?.valueChanges.subscribe((isChecked) => {
      if (isChecked) {
        this.testedDateControl?.enable();
        this.testedDateControl?.setValidators([Validators.required]);
      } else {
        this.testedDateControl?.disable();
        this.testedDateControl?.reset();
        this.testedDateControl?.clearValidators();
      }

      this.testedDateControl?.updateValueAndValidity();
    });
  }

  private addOneYear(date: Date): Date {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + 1);

    return newDate;
  }

  get testedDateControl() {
    return this.batchForm.get('date_tested');
  }

  createBatchForm(): FormGroup {
    return new FormGroup({
      valid_until: new FormControl<Date | null>(null, [Validators.required]),
      date_delivered: new FormControl<Date | null>(null, [Validators.required]),
      date_tested: new FormControl<Date | null>(null, [Validators.required]),
      supplier_id: new FormControl<number | null>(null, [Validators.required]),
      service_center: new FormControl<string | null>(null, [Validators.required]),
      purchaseRequestDTO: new FormGroup({
        number: new FormControl<number | null>(null, [Validators.required]),
        file: new FormControl<string | null>(null)
      }),
      is_tested: new FormControl<boolean>(false)
    });
  }

  getAllSuppliers(): void {
    this.requestAuth.getAllSuppliers().subscribe({
      next: (res: any) => {
        this.suppliers.set(res);
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

  addBatch(): void {
    this.batchForm.removeControl('is_tested');

    const rawValidUntil = this.batchForm.value.valid_until;
    const rawDateDelivered = this.batchForm.value.date_delivered;
    const rawDateTested = this.batchForm.value.date_tested;

    const batchRawValue = this.batchForm.getRawValue();

    const formattedPayload = {
      ...batchRawValue,
      valid_until: `${rawValidUntil.toISOString().split('T')[0]}`,
      date_delivered: `${rawDateDelivered.toISOString().split('T')[0]}`,
      date_tested: rawDateTested ? `${rawDateTested.toISOString().split('T')[0]}` : null,
      purchaseRequestDTO: {
        ...batchRawValue.purchaseRequestDTO
      }
    };

    this.requestAuth.postBatch(formattedPayload).subscribe({
      next: (res: any) => {
        this.notification.add({ severity: 'success', summary: 'Success', detail: `Batch created successfully.` });
        this.signalService.setBatchDetails(res);
        this.signalService.markBatchAsAdded();
        this.router.navigate(['/batch-list/batch-details']);
        this.emitCloseModal();
      },
      error: (error: any) => this.notification.add({ severity: 'error', summary: 'Error', detail: `${error}` })
    });
  }

  handleFileInput(event: Event): void {
    const fileInput = event.target as HTMLInputElement;

    if (fileInput?.files?.length) {
      const file = fileInput.files[0];

      this.fileUpload = file;

      this.fileConverter.fileToHex(this.fileUpload).then((hexString: string) => {
        this.batchForm.patchValue({ purchaseRequestDTO: { file: hexString } });
      });
    }
  }

  formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  emitCloseModal(): void {
    this.closeModal.emit(false);
    this.batchForm.reset();
  }

  cancelUpload(): void {
    this.fileInput.value = '';
    this.selectedFile.set('');
  }
}
