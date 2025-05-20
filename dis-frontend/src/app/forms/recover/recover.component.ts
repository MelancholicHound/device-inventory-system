import { Component, ElementRef, ViewChild, inject, signal, computed } from '@angular/core';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { interval, Subscription } from 'rxjs';

import { MessageService } from 'primeng/api';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';

import { passwordsMatchValidator } from '../../validator';
import { PasswordMatchModel } from '../../common';
import { UsersService } from '../../utilities/services/users.service';

@Component({
    selector: 'app-recover',
    imports: [
        StepperModule,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        PasswordModule,
        DividerModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule
    ],
    providers: [
        MessageService
    ],
    templateUrl: './recover.component.html',
    styleUrl: './recover.component.scss'
})
export class RecoverComponent {
    @ViewChild('email') inputEmail!: ElementRef<HTMLInputElement>;

    private subscription!: Subscription;

    formBuilder = inject(FormBuilder);
    userAuth = inject(UsersService);
    notification = inject(MessageService);

    isExisting: boolean = false;
    countdown: number = 3;

    emailValidatorForm = this.formBuilder.group({
        email: [null, Validators.required]
    });

    passMatcherForm = this.formBuilder.group({
        password: [null, Validators.required],
        confirmPassword: [null, Validators.required]
    }, { validators: passwordsMatchValidator() });

    passwordModel = new PasswordMatchModel();

    constructor() {
        this.passwordModel.formBinding(this.passMatcherForm);
    }

    checkIfExisting(): void {
        this.userAuth.getByEmail(this.emailValidatorForm.get('email')?.value).subscribe({
            next: () => {
                this.isExisting = true;
                this.inputEmail.nativeElement.style.border = '2px solid #28a745';
            },
            error: (error: any) => {
                this.notification.add({ severity: 'error', summary: 'Error', detail: `${error}` });
            }
        });
    }

    changePassword(): void {
        this.userAuth.changePassword(this.emailValidatorForm.value, this.passMatcherForm.value).subscribe({
            next: () => {
                const timer$ = interval(1000);

                this.countdown = 3;

                this.subscription = timer$.subscribe(() => {
                    if (this.countdown > 0) {
                        this.countdown--;
                    } else {
                        this.subscription.unsubscribe();
                    }
                });
            },
            error: (error: any) => this.notification.add({ severity: 'error', summary: 'Error', detail: `${error}` })
        });
    }

    passwordValidator() {
        return this.passMatcherForm.value.password === this.passMatcherForm.value.confirmPassword;
    }
}
