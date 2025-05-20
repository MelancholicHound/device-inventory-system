import { Component, Input, inject } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { AutoFocusModule } from 'primeng/autofocus';
import { ButtonModule } from 'primeng/button';

import { UtilService } from '../../utilities/services/util.service';

@Component({
    selector: 'app-supplier',
    imports: [
        InputTextModule,
        AutoFocusModule,
        ButtonModule,
        ReactiveFormsModule,
        FormsModule,
        CommonModule
    ],
    providers: [
        MessageService
    ],
    templateUrl: './supplier.component.html',
    styleUrl: './supplier.component.scss'
})
export class SupplierComponent {
    @Input({ required: true }) isAddingBatch!: () => void;

    supplierForm!: FormGroup;

    notification = inject(MessageService);
    utilAuth = inject(UtilService);

    constructor() {
        this.supplierForm = this.createSupplierForm();
    }

    createSupplierForm(): FormGroup {
        return new FormGroup({
            name: new FormControl<string | null>(null, [Validators.required]),
            location: new FormControl<string | null>(null, [Validators.required]),
            contactNumber: new FormControl<string | null>(null, [Validators.required]),
            emailAddress: new FormControl<string | null>(null, [Validators.required, Validators.email]),
            contactPersonDTO: new FormGroup({
                name: new FormControl<string | null>(null, [Validators.required]),
                phoneNumber: new FormControl<string | null>(null, [Validators.required])
            })
        });
    }

    postSupplier(): void {
        this.utilAuth.postSupplier(this.supplierForm.value).subscribe({
            next: () => {
                this.notification.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Supplier saved successfully'
                });

                setTimeout(() => {
                    this.isAddingBatch();
                    this.supplierForm.reset();
                }, 2000);
            },
            error: (error: any) => {
                this.notification.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `${error}`
                });

                this.supplierForm.reset();
            }
        });
    }
}
