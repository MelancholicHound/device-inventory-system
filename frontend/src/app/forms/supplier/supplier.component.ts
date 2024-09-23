import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ParamsService } from '../../util/services/params.service';

@Component({
  selector: 'supplier',
  standalone: true,
  imports: [
      ReactiveFormsModule,
      FormsModule
  ],
  providers: [
      ParamsService
  ],
  templateUrl: './supplier.component.html',
  styleUrl: './supplier.component.scss'
})
export class SupplierComponent implements OnInit {
    @Output() booleanEvent = new EventEmitter<boolean>();

    supplierForm!: FormGroup;

    constructor(private _params: ParamsService) { }

    createSupplierFormGroup(): FormGroup {
        return new FormGroup({
            supplierName: new FormControl('', [Validators.required]),
            location: new FormControl ('', [Validators.required]),
            emailAddress: new FormControl('', [Validators.required, Validators.email]),
            contactNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(11)])
        });
    }

    ngOnInit(): void {
        this.supplierForm = this.createSupplierFormGroup();
    }

    returnToggle() {
        this.supplierForm.reset();
        this.booleanEvent.emit(true);
    }

    saveSupplier() {
        this._params.saveSupplier(this.supplierForm.value).subscribe(
            () => { this.returnToggle(); }
        );
    }
}
