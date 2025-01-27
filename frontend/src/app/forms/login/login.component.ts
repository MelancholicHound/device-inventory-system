import { Component, OnInit, EventEmitter, Output, ElementRef, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule, Form } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../util/services/auth.service';
import { NotificationService } from '../../util/services/notification.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        FormsModule
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})

export class LoginComponent implements OnInit {
    @Output() booleanEvent = new EventEmitter<boolean>();
    @Output() userLog = new EventEmitter<boolean>();
    @ViewChild('recoverModal') recoverModal!: ElementRef;

    loginForm!: FormGroup;
    logError!: boolean;

    constructor(private router: Router,
                private auth: AuthService,
                private notification: NotificationService) { }

    createLoginFormGroup(): FormGroup {
        return new FormGroup({
            email: new FormControl('', [Validators.required, Validators.email]),
            password: new FormControl('', [Validators.required, Validators.minLength(8)])
        });
    }

    ngOnInit(): void {
        this.loginForm = this.createLoginFormGroup();
    }

    login() {
        this.auth.login(this.loginForm.value.email, this.loginForm.value.password).subscribe({
            next: () => { console.log('User Logged In') },
            error: (error) => {
                this.loginForm.reset();
                this.notification.showError(error);
            }
        });
    }
}
