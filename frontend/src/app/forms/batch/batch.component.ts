import { Component, OnInit, OnChanges, SimpleChanges, Output, Input, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgFor } from '@angular/common';

import { ParamsService } from '../../util/services/params.service';
import { state } from '@angular/animations';

@Component({
  selector: 'batch',
  standalone: true,
  imports: [
      ReactiveFormsModule,
      FormsModule,
      NgFor
  ],
  providers: [
      ParamsService
  ],
  templateUrl: './batch.component.html',
  styleUrl: './batch.component.scss'
})
export class BatchComponent implements OnInit, OnChanges {
    @Input() batchCounter: any;
    @Output() booleanEvent = new EventEmitter<boolean>();

    @ViewChild('fileUpload') fileUpload!: ElementRef;

    batchForm!: FormGroup;
    suppliers: any; counter!: any;

    event!: Event;

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
                number: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
                file: new FormControl('')
            })
        });
    }

    ngOnInit(): void {
        this.batchForm = this.createBatchFormGroup();
        this._params.getSuppliers().subscribe(res => this.suppliers = res);

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

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['batchCounter']) {
            this.counter = changes['batchCounter'].currentValue;
        }
    }

    addBatch() {
        this._params.saveBatch(this.batchForm.value).subscribe(
            () => {
                this.router.navigate(['add-batch'], {
                    queryParams: { branch: new Date().getTime() },
                    state: { addbatch: this.batchForm.value }
                });
                event?.preventDefault();
            }, (error) => { if (error) this.batchForm.reset() }
        );
    }
}
