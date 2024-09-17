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

    constructor(private router: Router,
                private _params: ParamsService) { }

    createBatchFormGroup(): FormGroup {
        return new FormGroup({
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
    }

    returnToggle() {
        this.batchForm.reset();
        this.booleanEvent.emit(true);
    }

    addBatch() {
        /* this._params.saveBatch(this.batchForm.value).subscribe(
            () => { this.router.navigate(['add-batch'], { queryParams: { main: new Date().getTime() } }); },
            (error) => { if (error) console.log(this.batchForm.value); }
        ); */
        this.router.navigate(['add-batch'], { queryParams: { ref: new Date().getTime() } });
        event?.preventDefault();
    }
}
