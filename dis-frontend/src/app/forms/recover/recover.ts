import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { interval, Subscription } from 'rxjs';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AutoFocusModule } from 'primeng/autofocus';
import { ToastModule } from 'primeng/toast';

import { Request } from '../../utilities/services/request';

import { passwordsMatchValidator } from '../../utilities/modules/validator';

@Component({
  selector: 'app-recover',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    FloatLabelModule,
    AutoFocusModule,
    ToastModule
  ],
  templateUrl: './recover.html',
  styleUrl: './recover.css'
})
export class Recover implements OnInit {
  @Input() isRecovered!: () => void;

  private subscription!: Subscription;

  requestAuth = inject(Request);
  notification = inject(MessageService);

  countdown: any | null = null;
  isExisting: boolean = false;

  password = signal('');
  confirmPassword = signal('');
  timer = signal(0);

  passwordMatch = computed(() =>
    this.password() === this.confirmPassword() && this.password() !== ''
  );

  recoverForm!: FormGroup;

  constructor() {
    this.recoverForm = this.createRecoverForm();
  }

  ngOnInit(): void {
    this.recoverForm.get('password')?.valueChanges.subscribe(value => this.password.set(value));
    this.recoverForm.get('confirmPassword')?.valueChanges.subscribe(value => this.confirmPassword.set(value));
  }

  get emailControl() {
    return this.recoverForm.get('email');
  }

  get passwordControl() {
    return this.recoverForm.get('password');
  }

  private startCountdown(): void {
    this.timer.set(3);

    this.countdown = interval(1000).subscribe(() => {
      this.timer.update(t => t - 1);

      if (this.timer() === 0) {
        this.countdown.unsubscribe();
        this.isRecovered();
      }
    });
  }

  createRecoverForm(): FormGroup {
    return new FormGroup({
      email: new FormControl<string | null>(null, [Validators.required, Validators.email]),
      password: new FormControl<string | null>(null, [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl<string | null>(null, [Validators.required, Validators.minLength(8)])
    }, { validators: passwordsMatchValidator() });
  }

  checkIfExisting(): void {
    this.requestAuth.getByEmail(this.recoverForm.value.email).subscribe({
      error: (error: any) => this.notification.add({ severity: 'error', summary: 'Error', detail: `${error}` })
    });
  }

  changePassword(): void {
    this.requestAuth.recover(this.recoverForm.value.email, this.recoverForm.value.password).subscribe({
      next: (res: any) => {
        this.startCountdown();
        this.notification.add({ severity: 'success', summary: 'Success', detail: `${res.message}` });
      },
      error: (error: any) => {
        this.notification.add({ severity: 'error', summary: 'Error', detail: `${error}` });
      }
    });
  }

  onBlurEmail() {
    if (this.emailControl?.dirty && this.emailControl?.pristine) {
      this.checkIfExisting();
    }
  }
}
