import { Component, Input, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MessageService } from 'primeng/api';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { Dialog } from 'primeng/dialog';
import { AutoFocusModule } from 'primeng/autofocus';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

import { Request } from '../../utilities/services/request';

import { Recover } from '../recover/recover';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    InputIcon,
    IconField,
    Dialog,
    AutoFocusModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    Recover
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  @Input() isSigningUp!: () => void;

  requestAuth = inject(Request);
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
      password: new FormControl<string | null>(null, [Validators.required, Validators.minLength(5)])
    });
  }

  login(): void {
    this.requestAuth.login(this.loginForm.value.email, this.loginForm.value.password)
    .subscribe({
      next: () => {
        this.notification.add({ severity: 'success', summary: 'Success', detail: 'User logged in.' });
      },
      error: (error: any) => {
        this.notification.add({ severity: 'error', summary: 'Error', detail: `${error}` });
        this.loginForm.reset();
      }
    });
  }

  showDialog(): void {
    this.visible = true;
  }
}
