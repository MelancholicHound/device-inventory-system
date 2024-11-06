import { Component, OnInit, EventEmitter, Output, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

import { AuthService } from '../../util/services/auth.service';
import { ParamsService } from '../../util/services/params.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgIf, NgFor,
    ],
    providers: [
        AuthService,
        ParamsService
    ],
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.scss'
})

export class SignupComponent implements OnInit {
    @Output() booleanEvent = new EventEmitter<boolean>();

    @ViewChild('signupModal') signupModal!: ElementRef;

    signupForm!: FormGroup; otpForm!: FormGroup;

    positions!: any;

    constructor(private auth: AuthService) { }

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

    ngOnInit(): void {
        this.signupForm = this.createSignupFormGroup();

        this.auth.getEmployeePositions().subscribe((positions) => {
            this.positions = positions;
        });
    }

    get emailControl() {
        return this.signupForm.get('email');
    }

    passwordMatchValidator() {
        const password = this.signupForm.get('password')?.value;
        const confirmPassword = this.signupForm.get('confirmPassword')?.value;

        return password === confirmPassword;
    }

    signup() {
        this.signupForm.removeControl('confirmPassword');
        this.signupForm.patchValue({ positionId: parseInt(this.signupForm.get('positionId')?.value, 10) }, { emitEvent: false });
        this.auth.signup(this.signupForm.value).subscribe({
            next: () =>  this.booleanEvent.emit(true),
            error: (error) => {
                this.signupForm.reset();
                console.log(error);
            }
        });
    }
}
