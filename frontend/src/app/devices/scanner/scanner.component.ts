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
                private scanAuth: DeviceScannerService) {
                const navigation = this.router.getCurrentNavigation();
                if (navigation?.extras.state) {
                    this.deviceCount = navigation.extras.state['count'];
                }
    }

    ngOnInit(): void {
        this.scannerForm = this.createScannerFormGroup();

        this.scanAuth.getScannerBrands().subscribe({
            next: (data: any[]) => this.fetchedScannerBrand = data,
            error: (error: any) => console.log(error)
        });

        //GET request of scanner type from scanAuth
    }

    createScannerFormGroup(): FormGroup {
        return new FormGroup({ });
    }

    //GET
    getDivisionValue() {
        let value = document.getElementById('division') as HTMLOptionElement;
        this.params.getSectionsById(value.value).subscribe(res => this.fetchedSection = res);
    }

    getSectionValue() {
        let value = document.getElementById('section') as HTMLOptionElement;
        this.scannerForm.patchValue({ sectionId: parseInt(value.value, 10) });
    }

    getScannerType() {

    }

    //Other functions
    toggleScannerBrandField() {
        this.isScannerBrandToggled = !this.isScannerBrandToggled;
        this.isScannerBrandAnimated = !this.isScannerBrandAnimated;
    }
}
