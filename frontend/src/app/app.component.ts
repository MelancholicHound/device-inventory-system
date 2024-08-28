import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';

import { LoginComponent } from './forms/login/login.component';
import { SignupComponent } from './forms/signup/signup.component';
import { NavigationComponent } from './components/navigation/navigation.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        NgIf,
        LoginComponent,
        SignupComponent,
        NavigationComponent
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})

export class AppComponent {
    title = 'DIS';

    toggleLoginForm: boolean = true;
    toggleSignupForm: boolean = false;

    toggleLogin(value: boolean) {
        this.toggleLoginForm = value;
        this.toggleSignupForm = !value;
    }

    toggleSignup(value: boolean) {
        this.toggleLoginForm = !value;
        this.toggleSignupForm = value;
    }
}
