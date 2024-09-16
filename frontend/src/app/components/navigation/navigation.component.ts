import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-navigation',
    standalone: true,
    imports: [
        NgFor
    ],
    templateUrl: './navigation.component.html',
    styleUrl: './navigation.component.scss'
})

export class NavigationComponent {
    divisions: any[] = [
        { name: 'Allied', indicator: 'allied' },
        { name: 'Finance', indicator: 'finance' },
        { name: 'HOPSS', indicator: 'hopss' },
        { name: 'Medical', indicator: 'medical' },
        { name: 'Nursing', indicator: 'nursing' },
        { name: 'Under MCC', indicator: 'under-mcc' },
        { name: 'Others', indicator: 'others' }
    ];

    constructor(private router: Router) { }

    ngOnInit(): void {
        let batchDelivery = document.getElementById('batch-delivery') as HTMLButtonElement;
        let computerInventory = document.getElementById('computer-inv') as HTMLButtonElement;
        let selectTab = document.getElementById('divisions') as HTMLSelectElement;

        batchDelivery.addEventListener("click", () => {
            batchDelivery.classList.add('active');
            computerInventory.classList.remove('active');
            selectTab.selectedIndex = 0;
            this.router.navigate(['batch-delivery'], { queryParams: { main: new Date().getTime() } });
        });

        computerInventory.addEventListener("click", () => {
            batchDelivery.classList.remove('active');
            computerInventory.classList.add('active');
            selectTab.selectedIndex = 0;
            this.router.navigate(['computer-inventory'], { queryParams: { main: new Date().getTime() } });
        });
    }
}
