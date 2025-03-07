import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

import { AuthService } from '../../util/services/auth.service';
import { NotificationService } from '../../util/services/notification.service';

@Component({
    selector: 'app-recover',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        MatStepperModule,
        MatButtonModule,
        MatFormFieldModule
    ],
    providers: [
      {
          provide: STEPPER_GLOBAL_OPTIONS,
          useValue: { showError: true, displayDefaultIndicatorType: false }
      }
    ],
    templateUrl: './recover.component.html',
    styleUrl: './recover.component.scss'
})
export class RecoverComponent {
    private formBuilder = inject(FormBuilder);
    private users = inject(AuthService);
    private notification = inject(NotificationService);

    isExisting: boolean = false;

    emailValidatorForm = this.formBuilder.group({
        email: [null, Validators.required]
    });

    passwordMatcher = this.formBuilder.group({
        password: [null, Validators.required],
        confirmPassword: [null, Validators.required]
    });

    checkIfExisting(): void {
        this.users.getByEmail(this.emailValidatorForm.get('email')?.value).subscribe({
            next: () => {
                this.isExisting = true;
            },
            error: (error: any) => {
                this.isExisting = false;
                this.notification.showError(error);
            }
        });
    }


}
