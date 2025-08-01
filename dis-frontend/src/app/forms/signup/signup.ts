import { Component, OnInit, Input, inject, signal, computed } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { interval } from 'rxjs';

import { MessageService } from 'primeng/api';
import { FloatLabel } from 'primeng/floatlabel';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AutoFocusModule } from 'primeng/autofocus';
import { ButtonModule } from 'primeng/button';

import { Request } from '../../utilities/services/request';
import { passwordsMatchValidator } from '../../utilities/modules/validator';

@Component({
  selector: 'app-signup',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    FloatLabel,
    ToastModule,
    InputTextModule,
    PasswordModule,
    AutoFocusModule,
    ButtonModule
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup implements OnInit {
  @Input({ required: true }) isSigningUp!: () => void;

  requestAuth = inject(Request);
  notification = inject(MessageService);

  countdown: any | null = null;
  isRegistered: boolean = false;

  password = signal('');
  confirmPassword = signal('');
  timer = signal(0);

  passwordsMatch = computed(() =>
    this.password() === this.confirmPassword() && this.password() !== ''
  );

  signupForm!: FormGroup;

  constructor() {
    this.signupForm = this.createSignupForm();
  }

  ngOnInit(): void {
    this.signupForm.get('password')?.valueChanges.subscribe(value => this.password.set(value));
    this.signupForm.get('confirmPassword')?.valueChanges.subscribe(value => this.confirmPassword.set(value));
  }

  get emailControl() {
    return this.signupForm.get('email');
  }

  get passwordControl() {
    return this.signupForm.get('password');
  }

  private signup(): void {
    this.signupForm.removeControl('confirmPassword');

    this.requestAuth.signup(this.signupForm.value).subscribe({
      next: (res: any) => {
        this.startCountdown();
        this.isRegistered = true;
        this.notification.add({ severity: 'success', summary: 'Success', detail: `${res.message}` });
      },
      error: (error: any) => {
        this.notification.add({ severity: 'error', summary: 'Error', detail: `${error}` });
      }
    });
  }

  private startCountdown(): void {
    this.timer.set(3);

    this.countdown = interval(1000).subscribe(() => {
      this.timer.update(t => t - 1);

      if (this.timer() === 0) {
        this.countdown.unsubscribe();
        this.isSigningUp();
      }
    });
  }

  createSignupForm(): FormGroup {
    return new FormGroup({
      first_name: new FormControl<string | null>(null, [Validators.required]),
      last_name: new FormControl<string | null>(null, [Validators.required]),
      email: new FormControl<string | null>(null, [Validators.required, Validators.email]),
      password: new FormControl<string | null>(null, [Validators.required, Validators.minLength(5)]),
      confirmPassword: new FormControl<string | null>(null, [Validators.required, Validators.minLength(5)])
    }, { validators: passwordsMatchValidator() });
  }

  validateEmail(): void {
    this.requestAuth.getByEmail(this.signupForm.value.email).subscribe({
      next: () => {
        this.notification.add({ severity: 'error', summary: 'Error', detail: 'Please use a different email.' });
        this.emailControl?.reset();
      },
      error: () => {
        this.signup();
      }
    });
  }
}
