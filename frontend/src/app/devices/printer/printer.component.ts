import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

import { ParamsService } from '../../util/services/params.service';
import { DevicePrinterService } from '../../util/services/device-printer.service';

@Component({
    selector: 'app-printer',
    standalone: true,
    imports: [
        NgFor, NgIf,
        ReactiveFormsModule,
        FormsModule
    ],
    providers: [
        ParamsService,
        DevicePrinterService
    ],
    templateUrl: './printer.component.html',
    styleUrl: './printer.component.scss'
})
export class PrinterComponent implements OnInit {
    device = { name: 'Printer', indicator: 'printer' };
    deviceCount!: any;

    isPrinterBrandToggled: boolean = false; isPrinterBrandAnimated: boolean = false;

    fetchedPrinterBrand!: any; fetchedType!: any;
    fetchedDivision!: any; fetchedSection!: any;

    printerBrandId!: any;
    secId!: any;

    printerForm!: FormGroup;

    constructor(private params: ParamsService,
                private printAuth: DevicePrinterService) { }

    ngOnInit(): void {
        this.deviceCount = localStorage.getItem('count');
        if (this.deviceCount) {
            localStorage.removeItem('count');
        }
    }

    getLaptopBrandValue() {
        let value = document.getElementById('brand-name') as HTMLOptionElement;
        this.printerBrandId = value.value;
    }

    getDivisionValue() {
        let value = document.getElementById('division') as HTMLOptionElement;
        this.params.getSectionsById(value.value).subscribe(res => this.fetchedSection = res);
    }

    getSectionValue() {
        let value = document.getElementById('section') as HTMLOptionElement;
        this.secId = value.value;
    }

    getPrinterType() {
        let value
    }

    togglePrinterBrandField() {
        this.isPrinterBrandToggled = !this.isPrinterBrandToggled;
        this.isPrinterBrandAnimated = !this.isPrinterBrandAnimated;
    }
}
