import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

import { Store } from '@ngrx/store';

import { ParamsService } from '../../util/services/params.service';
import { DeviceScannerService } from '../../util/services/device-scanner.service';

import { updateChildData } from '../../util/store/app.actions';

@Component({
    selector: 'app-scanner',
    standalone: true,
    imports: [
        NgFor, NgIf,
        ReactiveFormsModule,
        FormsModule
    ],
    providers: [
        ParamsService,
        DeviceScannerService
    ],
    templateUrl: './scanner.component.html',
    styleUrl: './scanner.component.scss'
})
export class ScannerComponent implements OnInit {
    device = { name: 'Scanner', indicator: 'scanner' };
    deviceCount: any; batchId: any; batchNumber: any;

    isScannerBrandToggled: boolean = false; isScannerBrandAnimated: boolean = false;

    fetchedScannerBrand!: any; fetchedType!: any;
    fetchedDivision!: any; fetchedSection!: any;

    scannerForm!: FormGroup;

    constructor(private params: ParamsService,
                private scannerAuth: DeviceScannerService,
                private store: Store) {}

    ngOnInit(): void {
        this.batchId = history.state.batchid;
        this.deviceCount = history.state.count;
        this.batchNumber = history.state.batchnumber;

        this.scannerForm = this.createScannerFormGroup();

        this.params.getAllDivisions().subscribe({
            next: (data: any[]) => this.fetchedDivision = data,
            error: (error: any) => console.error(error)
        });

        this.scannerAuth.getScannerBrands().subscribe({
            next: (data: any[]) => this.fetchedScannerBrand = data,
            error: (error: any) => console.error(error)
        });

        this.scannerAuth.getScannerType().subscribe({
            next: (data: any[]) => this.fetchedType = data,
            error: (error: any) => console.error(error)
        });
    }

    createScannerFormGroup(): FormGroup {
        return new FormGroup({
            batchId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            sectionId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            brandId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            model: new FormControl(null, [Validators.required]),
            scannerTypeId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')])
        });
    }

    //GET
    getScannerBrandValue() {
        let value = document.getElementById('scanner-brand') as HTMLOptionElement;
        this.scannerForm.patchValue({ brandId: parseInt(value.value, 10) });
    }

    getDivisionValue() {
        let value = document.getElementById('division') as HTMLOptionElement;
        this.params.getSectionsByDivisionId(value.value).subscribe((res: any[]) => this.fetchedSection = res);
    }

    getSectionValue() {
        let value = document.getElementById('section') as HTMLOptionElement;
        this.scannerForm.patchValue({ sectionId: parseInt(value.value, 10) });
    }

    getScannerTypeValue() {
        let value = document.getElementById('scanner-type') as HTMLOptionElement;
        this.scannerForm.patchValue({ scannerTypeId: parseInt(value.value, 10) });
    }

    //POST
    onScannerBrandInput(event: Event): void {
        let inputElement = event.target as HTMLInputElement;

        if (inputElement.value !== '') {
            this.scannerAuth.postScannerBrand(inputElement.value).subscribe({
                next: (res: any) => this.scannerForm.patchValue({ brandId: res.id }),
                error: (error: any) => console.error(error)
            });
        }
    }

    postScannerSpecs(): void {
        this.scannerForm.patchValue({ batchId: this.batchId });
        this.store.dispatch(updateChildData({ data: this.scannerForm.value }));
    }

    //Other functions
    toggleScannerBrandField() {
        this.isScannerBrandToggled = !this.isScannerBrandToggled;
        this.isScannerBrandAnimated = !this.isScannerBrandAnimated;
    }
}
