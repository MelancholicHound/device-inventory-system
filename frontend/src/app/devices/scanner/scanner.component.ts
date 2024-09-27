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
    deviceCount!: any;

    isScannerBrandToggled: boolean = false; isScannerBrandAnimated: boolean = false;

    fetchedScannerBrand!: any; fetchedType!: any;
    fetchedDivision!: any; fetchedSection!: any;

    scannerBrandId!: any;
    secId!: any;

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

    }

    getScannerBrandValue() {
        let value = document.getElementById('brand-name') as HTMLOptionElement;
        this.scannerBrandId = value.value;
    }

    getDivisionValue() {
        let value = document.getElementById('division') as HTMLOptionElement;
        this.params.getSectionsById(value.value).subscribe(res => this.fetchedSection = res);
    }

    getSectionValue() {
        let value = document.getElementById('section') as HTMLOptionElement;
        this.secId = value.value;
    }

    getScannerType() {

    }

    toggleScannerBrandField() {
        this.isScannerBrandToggled = !this.isScannerBrandToggled;
        this.isScannerBrandAnimated = !this.isScannerBrandAnimated;
    }
}
