import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';

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
            name: new FormControl('', [Validators.required]),
            location: new FormControl ('', [Validators.required]),
            contactNumber: new FormControl('', [Validators.required]),
            emailAddress: new FormControl('', [Validators.required, Validators.email]),
            contactPersonDTO: new FormGroup({
                name: new FormControl('', [Validators.required]),
                phoneNumber: new FormControl('', [Validators.required])
            })
        });
    }

    ngOnInit(): void {
        this.supplierForm = this.createSupplierFormGroup();
    }

    saveSupplier() {
        this._params.saveSupplier(this.supplierForm.value).subscribe(() => { this.booleanEvent.emit(true) });
    }
}
