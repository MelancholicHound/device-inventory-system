import { Component, OnInit, OnChanges, ChangeDetectorRef, ViewChild, Input, Output, EventEmitter, inject, effect, signal, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { switchMap, tap, catchError, of } from 'rxjs';

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
  @Input() resetForm!: boolean;

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

    this.batchForm.get('is_tested')?.valueChanges.subscribe((isChecked) => {
      if (isChecked) {
        this.testedDateControl?.disable();
        this.testedDateControl?.clearValidators();
      } else {
        this.testedDateControl?.enable();
        if (!this.batchDetails) {
          this.testedDateControl?.reset();
        }
        this.testedDateControl?.setValidators([Validators.required]);
      }
    })
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
        is_tested: this.batchDetails.date_tested ? false : true
      });

      this.batchForm.disable();
      this.isAdding.set(false);
    }

    if (changes['resetForm']) {
      this.emitCloseModal();
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
        file: new FormControl<File | null>(null)
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
    const formData = new FormData();

    Object.entries(this.batchForm.value).forEach(([key, value]) => {
      if (key === 'purchaseRequestDTO') {
        const purchaseDTO = value as any;
        formData.append('number', purchaseDTO?.number ?? '');
        if (purchaseDTO?.file) {
          formData.append('file', purchaseDTO.file);
        } else {
          formData.append('file', '');
        }
      } else if (value instanceof Date) {
        formData.append(key, value.toISOString().split('T')[0]);
      } else if (value === null || value === undefined) {
        formData.append(key, '');
      } else {
        formData.append(key, value as any);
      }
    });

    this.requestAuth.postBatch(formData).pipe(
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

      this.batchForm.get('purchaseRequestDTO.file')?.setValue(this.fileUpload);
    }
  }

  formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  emitCloseModal(): void {
    if (this.isAdding()) {
      this.batchForm.reset();
    }
    if (this.batchDetails && this.isEditing()) {
      this.batchForm.disable({ emitEvent: false });
      this.isEditing.set(false);
    }
    this.closeModal.emit(false);
  }

  cancelUpload(): void {
    this.fileInput.value = '';
    this.selectedFile.set('');
  }

  switchButton(): void {
    this.isEditing.set(true);
    this.batchForm.enable({ emitEvent: false });
  }

  downloadButton(): void {
    this.requestAuth.downloadFile(this.batchDetails.purchaseRequestDTO.file).subscribe({
      next: (res: any) => {
        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.batchDetails.purchaseRequestDTO.file}`; // force "Save as"
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  updateBatch(): void {
    this.requestAuth.putBatch(this.batchForm.value, this.batchDetails.id).pipe(
      tap((res: any) => {
        this.notification.add({
          severity: 'success',
          summary: 'Success',
          detail: `${res.message}`
        });
        this.signalService.markBatchAsAdded();
      }),
      switchMap(() => this.requestAuth.getBatchById(this.batchDetails.id)),
      tap((res: any) => this.signalService.batchDetails.set(res)),
      catchError((error: any) => {
        this.notification.add({
          severity: 'error',
          summary: 'Error',
          detail: `${error}`
        });

        return of(null);
      })
    ).subscribe(() => setTimeout(() => {
      this.emitCloseModal()
    }, 2000));
  }
}
