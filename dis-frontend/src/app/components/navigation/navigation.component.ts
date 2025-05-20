import { Component, Output, EventEmitter, ViewChild, AfterViewInit, inject } from '@angular/core';
import { RouterLinkActive, RouterLink, Router } from '@angular/router';

import { UsersService } from '../../utilities/services/users.service';

@Component({
  selector: 'app-navigation',
  imports: [
      RouterLink,
      RouterLinkActive
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements AfterViewInit {
    @Output() activeLink = new EventEmitter<string>();

    @ViewChild('batchLink') batchLink!: RouterLinkActive;
    @ViewChild('inventoryLink') inventoryLink!: RouterLinkActive;

    router = inject(Router);
    userAuth = inject(UsersService);

    private emitActiveLink() {
        if (this.batchLink?.isActive) {
            this.activeLink.emit('Batch List');
        } else if (this.inventoryLink?.isActive) {
            this.activeLink.emit('Device Inventory');
        }
    }

    constructor() {
        if (this.userAuth.isLoggedIn()) {
            this.router.navigate(['/batch-list']);
        }
    }

    ngAfterViewInit(): void {
        const observer = new MutationObserver(() => this.emitActiveLink());

        observer.observe(document.body, { childList: true, subtree: true });
    }
}
