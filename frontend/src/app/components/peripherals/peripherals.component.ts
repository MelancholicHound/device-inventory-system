import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';

import { ParamsService } from '../../util/services/params.service';

@Component({
    selector: 'app-peripherals',
    standalone: true,
    imports: [
        NgFor
    ],
    providers: [
        ParamsService
    ],
    templateUrl: './peripherals.component.html',
    styleUrl: './peripherals.component.scss'
})
export class PeripheralsComponent implements OnInit {
    fetchedUPSBrand!: any;

    constructor(private params: ParamsService) { }

    ngOnInit(): void {
        this.params.getUPSBrand().subscribe(res => this.fetchedUPSBrand = res);
    }
}
