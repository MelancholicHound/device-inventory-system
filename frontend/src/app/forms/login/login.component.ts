import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule, Form } from '@angular/forms';
import { Router } from '@angular/router';

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

    loginForm!: FormGroup;
    logError!: boolean;

    constructor(private router: Router) { }

    ngOnInit(): void {
        this.loginForm = this.createLoginFormGroup();

        var modal = document.querySelector('.recover-modal') as HTMLDivElement;
        var openModal = document.getElementById('open-recover-btn') as HTMLButtonElement;
        var closeModal = document.getElementById('close-recover-btn') as HTMLButtonElement;

        openModal.onclick = function() {
            modal.style.display = 'block';
        }

        closeModal.onclick = function() {
            modal.style.display = 'none';
        }
    }

    createLoginFormGroup(): FormGroup {
        return new FormGroup({
            email: new FormControl('', [Validators.required, Validators.email]),
            password: new FormControl('', [Validators.required, Validators.minLength(8)])
        });
    }

    returnToggle() {
        this.booleanEvent.emit(true);
    }
}
