import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgFor } from '@angular/common';

import { ParamsService } from '../../util/services/params.service';

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
export class BatchComponent implements OnInit {
    @Output() booleanEvent = new EventEmitter<boolean>();

    batchForm!: FormGroup;
    suppliers: any;

    event!: Event;

    constructor(private router: Router,
                private _params: ParamsService) { }

    createBatchFormGroup(): FormGroup {
        return new FormGroup({
            number: new FormControl('', [Validators.required]),
            file: new FormControl(),
            supplierId: new FormControl('', [Validators.required]),
            serviceCenter: new FormControl('', [Validators.required]),
            dateDelivered: new FormControl('', [Validators.required]),
            validUntil: new FormControl('', [Validators.required]),
            dateTested: new FormControl('', [Validators.required]),
        });
    }

    ngOnInit(): void {
        this.batchForm = this.createBatchFormGroup();
        this._params.getSuppliers().subscribe(res => this.suppliers = res);

        let uploadField = document.getElementById('file-upload') as HTMLInputElement;
        let uploadButton = document.getElementById('upload-btn') as HTMLButtonElement;

        uploadButton.addEventListener('click', () => {
            uploadField.click();
        });
    }

    returnToggle() {
        this.batchForm.reset();
        this.booleanEvent.emit(true);
    }

    addBatch() {
        this._params.saveBatch(this.batchForm.value).subscribe(
            () => {
                this.router.navigate(['add-batch'], { queryParams: { main: new Date().getTime() } });
                event?.preventDefault();
            }, (error) => { if (error) console.log(this.batchForm.value); }
        );
    }
}
