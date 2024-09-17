import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';

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

    isAuthenticated: boolean = false;
    toggleLoginForm: boolean = true; toggleSignupForm: boolean = false;

    constructor(private auth: AuthService) { }

    ngOnInit(): void {
        this.auth.userLogged$.subscribe((status: boolean) => { this.isAuthenticated = status; });
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
