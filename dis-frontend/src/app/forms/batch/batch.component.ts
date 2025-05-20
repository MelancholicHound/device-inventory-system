import { Component, OnInit, ViewChild, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { AutoFocusModule } from 'primeng/autofocus';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { FluidModule } from 'primeng/fluid';
import { Select } from 'primeng/select';
import { Checkbox } from 'primeng/checkbox';

import { UtilService } from '../../utilities/services/util.service';
import { Supplier } from '../../utilities/models/Supplier';

import { FileConverter } from '../../common';
import { BatchContainer } from '../../common';

@Component({
    selector: 'app-batch',
    imports: [
        InputTextModule,
        AutoFocusModule,
        ButtonModule,
        DatePickerModule,
        FluidModule,
        Select,
        Checkbox,
        ReactiveFormsModule,
        FormsModule,
        CommonModule
    ],
    providers: [
        MessageService
    ],
    templateUrl: './batch.component.html',
    styleUrl: './batch.component.scss'
})
export class BatchComponent implements OnInit {
    @Input({ required: true }) isAddingBatch!: () => void;
    @Output() closeModal = new EventEmitter<boolean>(true);
    @ViewChild('fileInput') fileInput!: HTMLInputElement;

    batchForm!: FormGroup;
    suppliers!: Supplier[];
    fileUpload: File | null = null;

    utilAuth = inject(UtilService);
    notification = inject(MessageService);
    router = inject(Router);

    selectedFile = signal('');

    fileConverter = new FileConverter();
    batchContainer = new BatchContainer();

    constructor() {
        this.batchForm = this.createBatchFormGroup();
    }

    ngOnInit(): void {
        this.utilAuth.getSuppliers().subscribe({
            next: (res: any) => this.suppliers = res,
            error: (error: any) => this.notification.add({ severity: 'error', summary: 'Error', detail: `${error}` })
        });

        this.batchForm.get('dateDelivered')?.valueChanges.subscribe(
            (startDate: any) => {
                if (startDate) {
                    const nextYearDate = this.addOneYear(new Date(startDate));
                    this.batchForm.get('validUntil')?.setValue(nextYearDate);
                }
            }
        );

        this.batchForm.get('isTested')?.valueChanges.subscribe(() => {
            const dateTested = document.getElementById('date-tested') as HTMLInputElement;

            if (this.batchForm.get('isTested')?.value) {
                dateTested.disabled = true;
                this.testedDateControl?.clearValidators();
            } else {
                dateTested.disabled = false;
                this.testedDateControl?.setValidators([Validators.required]);
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
        return this.batchForm.get('dateTested');
    }

    createBatchFormGroup(): FormGroup {
        return new FormGroup({
            validUntil: new FormControl<Date | null>({ value: null, disabled: false }, [Validators.required]),
            dateDelivered: new FormControl<Date | null>(null, [Validators.required]),
            dateTested: new FormControl<Date | null>(null, [Validators.required]),
            supplierId: new FormControl<number | null>(null, [Validators.required]),
            serviceCenter: new FormControl<string | null>('', [Validators.required]),
            purchaseRequestDTO: new FormGroup({
                number: new FormControl<number | null>(null, [Validators.required]),
                file: new FormControl<string | null>(null)
            }),
            isTested: new FormControl<boolean>(false)
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

    addBatch(): void {
        this.router.navigate(['/batch-list/batch-details']);
        this.emitCloseModal();
        /* this.batchForm.removeControl('isTested');

        const rawValue = this.batchForm.getRawValue();
        const formattedPayload = {
            ...rawValue,
            validUntil: this.formatDateLocal(rawValue.validUntil),
            dateDelivered: this.formatDateLocal(rawValue.dateDelivered),
            dateTested: this.formatDateLocal(rawValue.dateTested),
            purchaseRequestDTO: {
                ...rawValue.purchaseRequestDTO
            }
        };

        this.closeModal.emit(true);
        this.batchForm.reset;
        this.utilAuth.postBatch(formattedPayload).subscribe({
            next: (res: any) => {
                this.batchContainer.batchDetails.set(res);
                this.router.navigate(['/batch-list/batch-details']);
                this.emitCloseModal();
            },
            error: (error: any) => {
                this.notification.add({ severity: 'error', summary: 'Error', detail: `${error}` });
            }
        }); */
    }

    formatDateLocal(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    cancelUpload(): void {
        this.fileInput.value = '';
        this.selectedFile.set('');
    }

    emitCloseModal(): void {
        this.closeModal.emit(false);
        this.batchForm.reset;
    }
}
