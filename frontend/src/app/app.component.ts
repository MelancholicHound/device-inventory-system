import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';

import { BehaviorSubject } from 'rxjs';

import { LoginComponent } from './forms/login/login.component';
import { SignupComponent } from './forms/signup/signup.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { AuthService } from './util/services/auth.service';

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

export class AppComponent implements OnInit {
    title = 'DIS';

    isAuthenticated!: boolean;
    toggleLoginForm: boolean = true; toggleSignupForm: boolean = false;

    constructor(private auth: AuthService) { }

    ngOnInit(): void {
        this.observeToken('token');
    }

    observeToken(key: string, checkInterval = 100) {
        return new Promise((resolve, reject) => {
            let previousValue = localStorage.getItem(key);
            this.isAuthenticated = previousValue !== null;

            const interval = setInterval(() => {
                const currentValue = localStorage.getItem(key);

                if (!this.isAuthenticated && currentValue !== null) {
                    this.isAuthenticated = true;
                    previousValue = currentValue;
                    resolve(currentValue);
                }

                if (this.isAuthenticated && currentValue === null) {
                    this.isAuthenticated = false;
                }
            }, checkInterval);
        });
    }


    toggleLogin(value: boolean) {
        this.toggleLoginForm = value;
        this.toggleSignupForm = !value;
    }

    toggleSignup(value: boolean) {
        this.toggleLoginForm = !value;
        this.toggleSignupForm = value;
    }
}
