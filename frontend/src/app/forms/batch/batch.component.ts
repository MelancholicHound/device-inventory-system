import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

import { ParamsService } from '../../util/services/params.service';

@Component({
    selector: 'batch',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        FormsModule,
        NgFor, NgIf
    ],
    providers: [
        ParamsService
    ],
    templateUrl: './batch.component.html',
    styleUrl: './batch.component.scss'
})
export class BatchComponent implements OnInit {
    @Output() booleanEvent = new EventEmitter<boolean>();

    @ViewChild('fileUpload') fileUpload!: ElementRef;

    batchForm!: FormGroup; counter!: any;

    suppliers: any[] = []; fileUploaded!: File;
    event!: Event; selectedFile: string = '';

    constructor(private router: Router,
                private _params: ParamsService) { }

    createBatchFormGroup(): FormGroup {
        return new FormGroup({
            validUntil: new FormControl('', [Validators.required]),
            dateDelivered: new FormControl('', [Validators.required]),
            dateTested: new FormControl('', [Validators.required]),
            supplierId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            serviceCenter: new FormControl('', [Validators.required]),
            purchaseRequestDTO: new FormGroup({
                number: new FormControl('', [Validators.required]),
                file: new FormControl()
            })
        });
    }

    private bufferToHex(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        return Array.from(bytes)
        .map((byte) => ('0' + byte.toString(16)).slice(-2))
        .join('');
    }

    ngOnInit(): void {
        this.batchForm = this.createBatchFormGroup();
        this._params.getSuppliers().subscribe((value: any[]) => { this.suppliers = value });

        let checkbox = document.getElementById('not-tested') as HTMLInputElement;
        let testedDate = document.getElementById('date-tested') as HTMLInputElement;
        let testedDateControl = this.batchForm.get('dateTested');

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                testedDate.disabled = true;
                testedDateControl?.clearValidators();
            } else {
                testedDate.disabled = false;
                testedDateControl?.setValidators([Validators.required]);
            }

            testedDateControl?.updateValueAndValidity();
        });
    }

    onFileSelected(event: any): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            this.fileUploaded = input.files[0];
            const reader = new FileReader();

            reader.onload = () => {
                const arrayBuffer = reader.result as ArrayBuffer;
                this.selectedFile = this.bufferToHex(arrayBuffer);
            };

            reader.readAsArrayBuffer(file);
        }
    }

    cancelUpload() {
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        fileInput.value = '';
        this.selectedFile = '';
    }

    addBatch() {
        this.batchForm.get('purchaseRequestDTO.file')?.setValue(this.selectedFile);
        this._params.saveBatch(this.batchForm.value).subscribe({
            next: (data: any) => {
                this.router.navigate(['add-batch'], {
                    queryParams: { branch: new Date().getTime() },
                    state: { addbatch: data }
                });
                event?.preventDefault();
            },
            error: (error) => {
                console.log(error);
                this.batchForm.reset();
                return;
            }
        });
    }
}
