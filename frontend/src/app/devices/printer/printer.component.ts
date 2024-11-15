import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

import { Store } from '@ngrx/store';

import { ParamsService } from '../../util/services/params.service';
import { DevicePrinterService } from '../../util/services/device-printer.service';

import { updateChildData } from '../../util/store/app.actions';

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
                private printerAuth: DevicePrinterService,
                private store: Store) { }

    ngOnInit(): void {
        this.batchId = history.state.batchid;
        this.deviceCount = history.state.count;
        this.batchNumber = history.state.batchnumber;

        this.printerForm = this.createPrinterFormGroup();

        this.params.getAllDivisions().subscribe({
            next: (data: any[]) => this.fetchedDivision = data,
            error: (error: any) => console.log(error)
        });

        this.printerAuth.getPrinterBrands().subscribe({
            next: (data: any[]) => this.fetchedPrinterBrand = data,
            error: (error: any) => console.log(error)
        });

        this.printerAuth.getPrinterTypes().subscribe({
            next: (data: any[]) => this.fetchedType = data,
            error: (error: any) => console.log(error)
        });
    }

    createPrinterFormGroup(): FormGroup {
        return new FormGroup({
            batchId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            sectionId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            brandId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            model: new FormControl('', [Validators.required]),
            printerTypeId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            withScanner: new FormControl(false, [Validators.required])
        });
    }

    //GET
    getPrinterBrandValue() {
        let value = document.getElementById('print-brand') as HTMLOptionElement;
        this.printerForm.patchValue({ brandId: parseInt(value.value, 10) });
    }

    getDivisionValue() {
        let value = document.getElementById('division') as HTMLOptionElement;
        this.params.getSectionsByDivisionId(value.value).subscribe((res: any[]) => this.fetchedSection = res);
    }

    getSectionValue() {
        let value = document.getElementById('section') as HTMLOptionElement;
        this.printerForm.patchValue({ sectionId: parseInt(value.value, 10) });
    }

    getPrinterTypeValue() {
        let value = document.getElementById('printer-type') as HTMLOptionElement;
        this.printerForm.patchValue({ printerTypeId: parseInt(value.value, 10) });
    }

    //POST
    onPrinterBrandInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.printerAuth.postPrinterBrand(inputElement.value).subscribe({
                next: (res: any) => this.printerForm.patchValue({ brandId: res.id }),
                error: (error: any) => console.log(error)
            });
        }
    }

    postPrinterSpecs(): void {
        this.printerForm.patchValue({ batchId: this.batchId });
        this.store.dispatch(updateChildData({ data: this.printerForm.value }));
    }

    //Other functions
    togglePrinterBrandField() {
        this.isPrinterBrandToggled = !this.isPrinterBrandToggled;
        this.isPrinterBrandAnimated = !this.isPrinterBrandAnimated;
    }
}
