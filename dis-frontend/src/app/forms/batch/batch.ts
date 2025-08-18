import { Component, OnInit, OnChanges, ChangeDetectorRef, ViewChild, Input, Output, EventEmitter, inject, effect, signal, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { switchMap, tap } from 'rxjs';

import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { FluidModule } from 'primeng/fluid';
import { Select } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { Checkbox } from 'primeng/checkbox';

import { Requestservice } from '../../utilities/services/requestservice';
import { Signalservice } from '../../utilities/services/signalservice';

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
    TooltipModule,
    Checkbox
  ],
  templateUrl: './batch.html',
  styleUrl: './batch.css'
})
export class Batch implements OnInit, OnChanges {
  @Input() batchDetails: any;
  @Input() resetForm: any;

  @Output() closeModal = new EventEmitter<boolean>(true);

  @ViewChild('fileInput') fileInput!: HTMLInputElement;

  batchForm!: FormGroup;

  fileUpload: File | null = null;

  requestAuth = inject(Requestservice);
  signalService = inject(Signalservice);
  notification = inject(MessageService);
  router = inject(Router);

  selectedFile = signal('');
  isAdding = signal(true);
  isEditing = signal(false);
  suppliers = signal<SupplierInterface[]>([]);

  fileConverter = new FileConverter();

  constructor(private cdr: ChangeDetectorRef) {
    this.batchForm = this.createBatchForm();

    effect(() => {
      if (this.signalService.supplierSignal()) {
        this.suppliers.set(this.signalService.supplierList());
        this.signalService.resetSupplierFlag();
      }
    });
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
      this.testedDateControl?.enable();
      this.testedDateControl?.clearValidators();
      this.testedDateControl?.updateValueAndValidity();
    }

    this.batchForm.get('is_tested')?.valueChanges.subscribe((isChecked) => {
      if (isChecked) {
        this.testedDateControl?.disable();
        this.testedDateControl?.setValidators([Validators.required]);
      } else {
        this.testedDateControl?.enable();
        this.testedDateControl?.reset();
        this.testedDateControl?.clearValidators();
      }

      this.testedDateControl?.updateValueAndValidity();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['batchDetails']) {
      this.batchForm.patchValue({
        valid_until: new Date(this.batchDetails.valid_until),
        date_delivered: new Date(this.batchDetails.date_delivered),
        date_tested: this.batchDetails.date_tested ? new Date(this.batchDetails.date_tested) : null,
        supplier_id: this.batchDetails.supplier_id,
        service_center: this.batchDetails.service_center,
        purchaseRequestDTO: {
          number: this.batchDetails.purchaseRequestDTO.number,
          file: this.batchDetails.purchaseRequestDTO.file
        },
        is_tested: this.batchDetails.date_tested ?? true
      });

      this.batchForm.disable();
      this.isEditing.set(false);
    }

    if (changes['resetForm']) {
      this.batchForm.reset();
    }
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
        number: new FormControl<string | null>(null, [Validators.required]),
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

    this.requestAuth.postBatch(formattedPayload).pipe(
      tap(() => {
        this.notification.add({ severity: 'success', summary: 'Success', detail: `Batch created successfully.` });
        this.signalService.markBatchAsAdded();
        this.emitCloseModal();
      }),
      switchMap((res: any) => this.requestAuth.getBatchById(res.id)),
    ).subscribe({
        next: (batchDetails: any) => {
          this.signalService.batchDetails.set(batchDetails);
          this.router.navigate(['/batch-list/batch-details']);
        },
        error: (error: any) => {
          this.notification.add({ severity: 'error', summary: 'Error', detail: `${error}` });
        }
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

  switchButton(): void {
    this.isEditing.set(true);
    this.batchForm.enable();
  }

  updateBatch(): void {
    this.requestAuth.putBatch(this.batchForm.value, this.batchDetails.id).subscribe({
      next: (res: any) => {
        this.notification.add({
          severity: 'success',
          summary: 'Success',
          detail: `${res.message}`
        });

        this.signalService.markBatchAsAdded();
        setTimeout(() => {
          this.emitCloseModal();
        }, 2000);
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
