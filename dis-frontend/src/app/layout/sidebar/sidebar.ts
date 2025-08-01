import { Component, Output, EventEmitter, ViewChild, AfterViewInit, inject } from '@angular/core';
import { RouterLinkActive, RouterLink, Router } from '@angular/router';

import { Request } from '../../utilities/services/request';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements AfterViewInit {
  @Output() activeLink = new EventEmitter<string>();

  @ViewChild('dashboardLink') dashboardLink!: RouterLinkActive;
  @ViewChild('batchLink') batchLink!: RouterLinkActive;
  @ViewChild('inventoryLink') inventoryLink!: RouterLinkActive;
  @ViewChild('supplierLink') supplierLink!: RouterLinkActive;
  @ViewChild('auditLink') auditLink!: RouterLinkActive;

  router = inject(Router);
  requestAuth = inject(Request);

  private emitActiveLink() {
    if (this.dashboardLink?.isActive) {
      this.activeLink.emit('Dashboard');
    } else if (this.batchLink?.isActive) {
      this.activeLink.emit('Batch List');
    } else if (this.inventoryLink?.isActive) {
      this.activeLink.emit('Device Inventory')
    } else if (this.supplierLink?.isActive) {
      this.activeLink.emit('Supplier');
    } else if (this.auditLink?.isActive) {
      this.activeLink.emit('Audit Trail');
    }
  }

  constructor() {
    if (this.requestAuth.isLoggedIn()) {
      this.router.navigate(['/batch-list']);
    }
  }

  ngAfterViewInit(): void {
    const observer = new MutationObserver(() => this.emitActiveLink());

    observer.observe(document.body, { childList: true, subtree: true });
  }
}
