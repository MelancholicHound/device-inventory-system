import { Component, OnInit, Input, inject, signal, computed } from '@angular/core';
import { FormsModule, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { interval } from 'rxjs';

import { MessageService } from 'primeng/api';
import { Select } from 'primeng/select';
import { KeyFilterModule } from 'primeng/keyfilter';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { AutoFocusModule } from 'primeng/autofocus';

import { UsersService } from '../../utilities/services/users.service';

import { passwordsMatchValidator } from '../../validator';
import { Positions } from '../../utilities/models/Positions';

@Component({
    selector: 'app-signup',
    imports: [
        Select,
        InputTextModule,
        KeyFilterModule,
        PasswordModule,
        DividerModule,
        AutoFocusModule,
        ReactiveFormsModule,
        FormsModule,
        CommonModule
    ],
    providers: [
        MessageService
    ],
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
    @Input({ required: true }) isSigningUp!: () => void;

    userAuth = inject(UsersService);
    notification = inject(MessageService);

    positions: Positions[] | undefined;
    countdown: any | null = null;
    timer: number = 3;
    isRegistered: boolean = false;

    password = signal('');
    confirmPassword = signal('');

    passwordsMatch = computed(() =>
        this.password() === this.confirmPassword() && this.password() !== ''
    );

    signupForm!: FormGroup;

    constructor() {
        this.signupForm = this.createSignupForm();
    }

    ngOnInit(): void {
        this.userAuth.getEmployeePositions().subscribe({
            next: (res: any[]) => this.positions = res,
            error: (error: any) => this.notification.add({ severity: 'error', summary: 'Error', detail: `${error}` })
        });

        this.signupForm.get('password')?.valueChanges.subscribe(value => this.password.set(value));
        this.signupForm.get('confirmPassword')?.valueChanges.subscribe(value => this.confirmPassword.set(value));

        this.signupForm.get('positionRanking')?.valueChanges.subscribe(
            (res: any) => this.signupForm.patchValue({ positionRanking: parseInt(res, 10) }, { emitEvent: false })
        );
    }

    private signup(): void {
        this.signupForm.removeControl('confirmPassword');

        this.userAuth.signup(this.signupForm.value).subscribe({
            next: () => {
                this.startCountdown();
                this.isRegistered = true;
                this.notification.add({ severity: 'success', summary: 'Account created', detail: `Created sucessfully`, life: 3200 });
            },
            error: (error: any) => {
                this.notification.add({ severity: 'error', summary: 'Signup failed', detail: `${error}` });
            }
        })
    }

    private startCountdown(): void {
        this.countdown = interval(1000)
        .subscribe(() => {
            this.timer--;
            if (this.timer === 0) {
                this.timer = 3;
            }
        });

        setTimeout(() => {
            this.countdown.unsubscribe;
            this.isSigningUp();
        }, 3000);
    }

    get emailControl() {
        return this.signupForm.get('email');
    }

    createSignupForm(): FormGroup {
        return new FormGroup({
            firstName: new FormControl<string | null>(null, [Validators.required]),
            middleName: new FormControl<string | null>(null, [Validators.required]),
            lastName: new FormControl<string | null>(null, [Validators.required]),
            positionId: new FormControl<number | null>(null, [Validators.required]),
            positionRanking: new FormControl<number | null>(null, [Validators.required]),
            email: new FormControl<string | null>(null, [Validators.required, Validators.email]),
            password: new FormControl<string | null>(null, [Validators.required, Validators.minLength(8)]),
            confirmPassword: new FormControl<string | null>(null, [Validators.required])
        }, { validators: passwordsMatchValidator() });
    }

    validateEmail(): void {
        this.userAuth.getByEmail(this.signupForm.value.email).subscribe({
            next: () => {
                this.notification.add({ severity: 'error', summary: 'Email already exists.', detail: 'Please use a different email address' });
                this.signupForm.get('email')?.reset();
            },
            error: () => {
                this.signup();
            }
        });
    }
}
