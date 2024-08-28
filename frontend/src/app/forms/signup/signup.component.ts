import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../util/services/auth.service';

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NgIf,
        NgFor
    ],
    providers: [
        AuthService
    ],
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.scss'
})

export class SignupComponent implements OnInit {
    @Output() booleanEvent = new EventEmitter<boolean>();

    signupForm!: FormGroup; otpForm!: FormGroup;
    passwordValidation!: FormGroup;

    position!: any;

    constructor(private router: Router,
                private auth: AuthService) { }

    ngOnInit(): void {
        this.signupForm = this.createSignupFormGroup();
        this.otpForm = this.createOTPFormGroup();

        var modal = document.querySelector('.otp-signup-modal') as HTMLDivElement;
        var openModal = document.getElementById('open-signup-btn') as HTMLButtonElement;
        var closeModal = document.getElementById('close-signup-btn') as HTMLButtonElement;

        openModal.onclick = function() {
            modal.style.display = 'block';
        }

        closeModal.onclick = function() {
            modal.style.display = 'none';
        }
    }

    createSignupFormGroup(): FormGroup {
        return new FormGroup({
            firstName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
            middleName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
            lastName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
            positionId: new FormControl('', [Validators.required]),
            positionRanking: new FormControl('', [Validators.required]),
            email: new FormControl('', [Validators.required, Validators.email]),
            password: new FormControl('', [Validators.required, Validators.minLength(8)]),
            confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8)])
        });
    }

    createOTPFormGroup(): FormGroup {
        return new FormGroup({
            numOne: new FormControl('', [Validators.required, Validators.maxLength(1), Validators.pattern('^[0-9]*$')]),
            numTwo: new FormControl('', [Validators.required, Validators.maxLength(1), Validators.pattern('^[0-9]*$')]),
            numThree: new FormControl('', [Validators.required, Validators.maxLength(1), Validators.pattern('^[0-9]*$')]),
            numFour: new FormControl('', [Validators.required, Validators.maxLength(1), Validators.pattern('^[0-9]*$')])
        });
    }

    passwordMatchValidator() {
        const password = this.signupForm.get('password')?.value;
        const confirmPassword = this.signupForm.get('confirmPassword')?.value;

        return password === confirmPassword;
    }

    signup() {
        this.signupForm.removeControl('confirmPassword');
        this.signupForm.patchValue({ positionId: parseInt(this.signupForm.get('positionId')?.value, 10) }, { emitEvent: false });
    }

    returnToggle() {
        this.booleanEvent.emit(true);
    }
}
