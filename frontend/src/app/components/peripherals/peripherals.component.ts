import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgFor } from '@angular/common';

import { ParamsService } from '../../util/services/params.service';
import { SpecsService } from '../../util/services/specs.service';

@Component({
    selector: 'app-peripherals',
    standalone: true,
    imports: [
        NgFor
    ],
    providers: [
        ParamsService,
        SpecsService
    ],
    templateUrl: './peripherals.component.html',
    styleUrl: './peripherals.component.scss'
})
export class PeripheralsComponent implements OnInit {
    fetchedData: any; fetchedUPSBrand: any;

    constructor(private params: ParamsService,
                private specs: SpecsService) { }

    ngOnInit(): void {
        this.params.getPeripherals().subscribe({
            next: (data: any) => {
                this.fetchedData = data.map((object: any) => ({
                    id: object.id,
                    name: object.name.toLowerCase()
                }));

                for (let i = 0; i < this.fetchedData.length; i++) {
                    if (this.fetchedData[i].name === 'e pen') {
                        this.fetchedData[i].name = 'E Pen';
                    }
                }
            },
            error: (error: any) => { console.log(error) }
        });

        this.specs.getUPSBrand().subscribe({
            next: (data: any) => { this.fetchedUPSBrand = data },
            error: (error: any) => { console.log(error) }
        });
    }
}
