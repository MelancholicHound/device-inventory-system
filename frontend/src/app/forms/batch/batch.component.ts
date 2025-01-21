import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Validators, FormGroup, FormControl, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

import { ParamsService } from '../../util/services/params.service';
import { SpecsService } from '../../util/services/specs.service';
import { NotificationService } from '../../util/services/notification.service';
import { TransactionService } from '../../util/services/transaction.service';

@Component({
    selector: 'batch',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        FormsModule,
        NgFor, NgIf
    ],
    providers: [
        ParamsService,
        NotificationService,
        SpecsService,
        TransactionService
    ],
    templateUrl: './batch.component.html',
    styleUrl: './batch.component.scss'
})
export class BatchComponent implements OnInit {
    @Output() booleanEvent = new EventEmitter<boolean>();

    @ViewChild('fileUpload') fileUpload!: ElementRef;

    batchForm!: FormGroup; counter!: any;

    suppliers: any[] = []; fileUploaded: File | null = null;
    event!: Event; selectedFile: string = '';

    constructor(private router: Router,
                private notification: NotificationService,
                private params: ParamsService,
                private transaction: TransactionService) { }

    private addOneYear(date: Date): Date {
        const newDate = new Date(date);
        newDate.setFullYear(newDate.getFullYear() + 1);
        return newDate;
    }

    ngOnInit(): void {
        this.batchForm = this.createBatchFormGroup();
        this.params.getSuppliers().subscribe((value: any[]) => { this.suppliers = value });

        let testedDate = document.getElementById('date-tested') as HTMLInputElement;
        let testedDateControl = this.batchForm.get('dateTested');

        this.batchForm.get('isTested')?.valueChanges.subscribe(() => {
            if (this.batchForm.get('isTested')?.value) {
                testedDate.disabled = true;
                testedDateControl?.clearValidators();
            } else {
                testedDate.disabled = false;
                testedDateControl?.setValidators([Validators.required]);
            }

            testedDateControl?.updateValueAndValidity();
        });

        this.batchForm.get('dateDelivered')?.valueChanges.subscribe((startDate) => {
            if (startDate) {
                const nextYearDate = this.addOneYear(new Date(startDate));
                this.batchForm.get('validUntil')?.setValue(nextYearDate.toISOString().split('T')[0]);
            }
        });
    }

    createBatchFormGroup(): FormGroup {
        return new FormGroup({
            validUntil: new FormControl(null, [Validators.required]),
            dateDelivered: new FormControl(null, [Validators.required]),
            dateTested: new FormControl(null, [Validators.required]),
            supplierId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            serviceCenter: new FormControl(null, [Validators.required]),
            purchaseRequestDTO: new FormGroup({
                number: new FormControl(null, [Validators.required]),
                file: new FormControl()
            }),
            isTested: new FormControl(false, [Validators.required])
        });
    }

    //GET
    getSupplierValue() {
        let value = document.getElementById('supplier') as HTMLOptionElement;
        this.batchForm.patchValue({ supplierId: parseInt(value.value, 10) });
    }

    //POST
    handFileInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input?.files?.length) {
            const file = input.files[0];
            this.fileUploaded = file;

            this.transaction.fileToHex(file).then((hexString: string) => {
                console.log(hexString);
                this.batchForm.patchValue({ purchaseRequestDTO: { file: hexString } });
            })
        }
    }

    addBatch() {
        this.batchForm.removeControl('isTested');
        console.log(this.batchForm.value);
        this.params.postBatch(this.batchForm.value).subscribe({
            next: (data: any) => {
                this.router.navigate(['add-batch'], { state: { addbatch: data } });
                localStorage.setItem('state', 'ADD');
            },
            error: (error: any) => {
                this.notification.showError(`An error occured: ${error}`);
                this.batchForm.reset();
            }
        });
    }

    //Other functions
    cancelUpload() {
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        fileInput.value = '';
        this.selectedFile = '';
    }
}
