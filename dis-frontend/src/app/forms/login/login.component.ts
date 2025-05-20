import { Component, inject, signal, Input } from '@angular/core';
import { FormsModule, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MessageService } from 'primeng/api';
import { InputIcon } from 'primeng/inputicon';
import { Dialog } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { IconField } from 'primeng/iconfield';
import { AutoFocusModule } from 'primeng/autofocus';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

import { UsersService } from '../../utilities/services/users.service';

import { RecoverComponent } from '../recover/recover.component';

@Component({
    selector: 'app-login',
    imports: [
        InputIcon,
        IconField,
        Dialog,
        Toast,
        InputTextModule,
        ButtonModule,
        AutoFocusModule,
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        RecoverComponent
    ],
    providers: [
        MessageService
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    @Input({ required: true }) isSigningUp!: () => void;

    userAuth = inject(UsersService);
    notification = inject(MessageService);

    loginForm!: FormGroup;

    visible: boolean = false;

    closeModal = signal(false);
    error = signal(false);

    constructor() {
        this.loginForm = this.createLoginForm();
    }

    createLoginForm(): FormGroup {
        return new FormGroup({
            email: new FormControl<string | null>(null, [Validators.required, Validators.email]),
            password: new FormControl<string | null>(null, [Validators.required, Validators.minLength(8)])
        });
    }

    login(): void {
        this.userAuth.login(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe({
            error: (error: any) => {
                this.notification.add({ severity: 'error', summary: 'Error', detail: `${error}`});
                this.error.set(true);
                this.loginForm.reset();
            }
        });
    }

    showDialog(): void {
        this.visible = true;
    }
}
