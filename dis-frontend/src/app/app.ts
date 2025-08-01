import { Component, OnInit, inject, effect, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MessageService, MenuItem } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { Menu } from 'primeng/menu';

import { UserInterface } from './utilities/models/UserInterface';

import { Request } from './utilities/services/request';

import { Login } from './forms/login/login';
import { Signup } from './forms/signup/signup';
import { Sidebar } from './layout/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    ToastModule,
    Menu,
    ButtonModule,
    RouterOutlet,
    Login,
    Signup,
    Sidebar
  ],
  providers: [
    MessageService
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('dis-frontend');

  profileMenu: MenuItem[] | undefined;

  requestAuth = inject(Request);
  notification = inject(MessageService);

  isSigningUp = signal(false);
  navigationLabel = signal('');

  isUserLogged = this.requestAuth.isLoggedIn;
  userDetails = signal<Partial<UserInterface>>({});

  constructor() {
    effect(() => {
      if (this.isUserLogged()) {
        this.requestAuth.getUser().subscribe({
          next: (res: any) => this.userDetails.set(res),
          error: (error: any) => this.notification.add({ severity: 'error', summary: 'Error', detail: `${error}` })
        });
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
            this.requestAuth.removeToken();
          }
        }
      ]
    }];
  }

  handleActiveLink(label: string) {
    this.navigationLabel.set(label);
  }

  updateState = () => this.isSigningUp.update(() => !this.isSigningUp());
}
