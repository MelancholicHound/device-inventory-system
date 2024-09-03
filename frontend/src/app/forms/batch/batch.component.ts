import { Component, Output, EventEmitter } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-batch',
  standalone: true,
  imports: [
      ReactiveFormsModule,
      FormsModule
  ],
  templateUrl: './batch.component.html',
  styleUrl: './batch.component.scss'
})
export class BatchComponent {
    @Output() booleanEvent = new EventEmitter<boolean>();
    @Output() isAddingBatch = new EventEmitter<boolean>();

    batchForm!: FormGroup;

    constructor(private router: Router) { }

    createBatchFormGroup(): FormGroup {
        return new FormGroup({
            supplierId: new FormControl('', [Validators.required]),
            serviceCenter: new FormControl('', [Validators.required]),
            dateDelivered: new FormControl('', [Validators.required]),
            validUntil: new FormControl('', [Validators.required]),
            dateTested: new FormControl('', [Validators.required]),
        });
    }

    returnToggle() {
        this.booleanEvent.emit(true);
    }

    addBatch() {
        this.isAddingBatch.emit(true);
    }
}
