import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ParamsService } from '../../util/services/params.service';
import { NotificationService } from '../../util/services/notification.service';

@Component({
  selector: 'supplier',
  standalone: true,
  imports: [
      ReactiveFormsModule,
      FormsModule
  ],
  providers: [
      ParamsService,
      NotificationService
  ],
  templateUrl: './supplier.component.html',
  styleUrl: './supplier.component.scss'
})
export class SupplierComponent implements OnInit {
    @Output() booleanEvent = new EventEmitter<boolean>();

    supplierForm!: FormGroup;

    constructor(private params: ParamsService,
                private notification: NotificationService) { }

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
        this.params.postSupplier(this.supplierForm.value).subscribe({
            next: () => {
                this.notification.showError('Supplier saved successfully!')
                setTimeout(() => {
                    this.booleanEvent.emit(true);
                    this.supplierForm.reset();
                }, 1000)
            },
            error: (error) => {
                this.notification.showError(`Error occured: ${error.message}`);
                this.supplierForm.reset();
                this.booleanEvent.emit(false);
            }
        });
    }
}
