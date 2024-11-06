import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';

import { ParamsService } from '../../util/services/params.service';
import { DeviceScannerService } from '../../util/services/device-scanner.service';

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
                private router: Router,
                private scannerAuth: DeviceScannerService) {
                const navigation = this.router.getCurrentNavigation();
                if (navigation?.extras.state) {
                    this.deviceCount = navigation.extras.state['count'];
                }
    }

    ngOnInit(): void {
        this.scannerForm = this.createScannerFormGroup();

        this.params.getAllDivisions().subscribe({
            next: (data: any[]) => this.fetchedDivision = data,
            error: (error: any) => console.log(error)
        });

        this.scannerAuth.getScannerBrands().subscribe({
            next: (data: any[]) => this.fetchedScannerBrand = data,
            error: (error: any) => console.log(error)
        });

        this.scannerAuth.getScannerType().subscribe({
            next: (data: any[]) => this.fetchedType = data,
            error: (error: any) => console.log(error)
        });
    }

    createScannerFormGroup(): FormGroup {
        return new FormGroup({
            batchId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            sectionId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            brandId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            model: new FormControl('', [Validators.required]),
            scannerTypeId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')])
        });
    }

    //GET
    getScannerBrandValue() {
        let value = document.getElementById('scanner-brand') as HTMLOptionElement;
        this.scannerForm.patchValue({ brandId: parseInt(value.value, 10) });
    }

    getDivisionValue() {
        let value = document.getElementById('division') as HTMLOptionElement;
        this.params.getSectionsById(value.value).subscribe(res => this.fetchedSection = res);
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
                error: (error: any) => console.log(error)
            });
        }
    }

    postScannerSpecs(): void {
        console.log(this.scannerForm.value);
    }

    //Other functions
    toggleScannerBrandField() {
        this.isScannerBrandToggled = !this.isScannerBrandToggled;
        this.isScannerBrandAnimated = !this.isScannerBrandAnimated;
    }
}
