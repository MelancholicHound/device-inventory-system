import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-navigation',
    standalone: true,
    imports: [ CommonModule ],
    templateUrl: './navigation.component.html',
    styleUrl: './navigation.component.scss'
})

export class NavigationComponent {

    @ViewChild('accountDetails') accountDetails!: ElementRef;

    constructor(private router: Router) { }

    ngOnInit(): void {
        let batchDelivery = document.getElementById('batch-delivery') as HTMLButtonElement;
        let computerInventory = document.getElementById('computer-inv') as HTMLButtonElement;

        batchDelivery.addEventListener("click", () => {
            batchDelivery.classList.add('active');
            computerInventory.classList.remove('active');
            this.router.navigate(['batch-delivery']);
        });

        computerInventory.addEventListener("click", () => {
            batchDelivery.classList.remove('active');
            computerInventory.classList.add('active');
            this.router.navigate(['computer-inventory']);
        });
    }

    logOut(): void {
        localStorage.removeItem('token');
    }
}
