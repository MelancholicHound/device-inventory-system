import { Component, OnInit, inject, effect, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';

import { UsersService } from './utilities/services/users.service';

import { NavigationComponent } from './components/navigation/navigation.component';
import { LoginComponent } from './forms/login/login.component';
import { SignupComponent } from './forms/signup/signup.component';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        ToastModule,
        Menu,
        CommonModule,
        ButtonModule,
        NavigationComponent,
        LoginComponent,
        SignupComponent
    ],
    providers: [
        MessageService
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
    title = 'DIS v2';

    profileMenu: MenuItem[] | undefined;

    userAuth = inject(UsersService);
    notification = inject(MessageService);

    isSigningUp = signal(false);
    navigationLabel = signal('');

    isUserLogged = this.userAuth.isLoggedIn;

    constructor() {
        effect(() => {
            if (this.isUserLogged()) {
                this.notification.add({ severity: 'success', summary: 'Success', detail: 'Logged in successfully.' });
            }
        });
    }

    ngOnInit(): void {
        this.profileMenu = [{
            label: 'Profile',
            items: [
                {
                    label: 'Personal Information',
                    icon: 'pi pi-user'
                },
                {
                    label: 'Sign out',
                    icon: 'pi pi-sign-out',
                    command: () => {
                        this.userAuth.removeToken();
                    }
                }
            ]
        }]
    }

    handleActiveLink(label: string){
        this.navigationLabel.set(label);
    }

    updateState = () => this.isSigningUp.update(() => !this.isSigningUp());
}
