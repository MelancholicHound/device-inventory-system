import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';

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
    deviceCount!: any; batchId!: any; batchNumber!: any;

    isPrinterBrandToggled: boolean = false; isPrinterBrandAnimated: boolean = false;

    fetchedPrinterBrand!: any; fetchedType!: any;
    fetchedDivision!: any; fetchedSection!: any;

    printerForm!: FormGroup;

    constructor(private params: ParamsService,
                private router: Router,
                private printAuth: DevicePrinterService) {
                const navigation = this.router.getCurrentNavigation();
                if (navigation?.extras.state) {
                    this.deviceCount = navigation.extras.state['count'];
                }
    }

    ngOnInit(): void {
        this.printerForm = this.createPrinterFormGroup();

        this.params.getAllDivisions().subscribe({
            next: (data: any[]) => this.fetchedDivision = data,
            error: (error: any) => console.log(error)
        });

        //GET request of printer type from printAuth
    }

    createPrinterFormGroup(): FormGroup {
        return new FormGroup({
            batchId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            sectionId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            brandId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            model: new FormControl('', [Validators.required]),
            printerTypeId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            withScanner: new FormControl()
        });
    }

    //GET
    getPrinterBrandValue() {
        let value = document.getElementById('print-brand') as HTMLOptionElement;
        this.printerForm.patchValue({ brandId: parseInt(value.value, 10) });
    }

    getDivisionValue() {
        let value = document.getElementById('division') as HTMLOptionElement;
        this.params.getSectionsById(value.value).subscribe(res => this.fetchedSection = res);
    }

    getSectionValue() {
        let value = document.getElementById('section') as HTMLOptionElement;
        this.printerForm.patchValue({ sectionId: parseInt(value.value, 10) });
    }

    //POST
    onPrinterBrandInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.printAuth.postPrinterBrand(inputElement.value).subscribe({
                next: (res: any) => this.printerForm.patchValue({ brandId: res.id }),
                error: (error: any) => console.log(error)
            });
        }
    }

    //Other functions
    togglePrinterBrandField() {
        this.isPrinterBrandToggled = !this.isPrinterBrandToggled;
        this.isPrinterBrandAnimated = !this.isPrinterBrandAnimated;
    }
}
