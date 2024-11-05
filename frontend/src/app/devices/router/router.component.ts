import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';

import { ParamsService } from '../../util/services/params.service';
import { DeviceRouterService } from '../../util/services/device-router.service';
import { validateHorizontalPosition } from '@angular/cdk/overlay';

@Component({
    selector: 'app-router',
    standalone: true,
    imports: [
        NgFor, NgIf,
        ReactiveFormsModule,
        FormsModule
    ],
    providers: [
        ParamsService,
        DeviceRouterService
    ],
    templateUrl: './router.component.html',
    styleUrl: './router.component.scss'
})
export class RouterComponent implements OnInit {
    device = { name: 'Router', indicator: 'router' };
    deviceCount!: any; batchId: any; batchNumber: any;

    isRouterBrandToggled: boolean = false; isRouterBrandAnimated: boolean = false;

    fetchedRouterBrand!: any; fetchedNetSpeed!: any; fetchedAntenna!: any;
    fetchedDivision!: any; fetchedSection!: any;

    routerForm!: FormGroup;

    constructor(private params: ParamsService,
                private router: Router,
                private routerAuth: DeviceRouterService) {
                const navigation = this.router.getCurrentNavigation();
                if (navigation?.extras.state) {
                    this.deviceCount = navigation.extras.state['count'];
                }
    }

    ngOnInit(): void {
        this.routerForm = this.createRouterFormGroup();

        this.routerAuth.getRouterBrands().subscribe({
            next: (data: any[]) => this.fetchedRouterBrand = data,
            error: (error: any) => console.log(error)
        });

        this.params.getAllDivisions().subscribe({
            next: (data: any[]) => this.fetchedDivision = data,
            error: (error: any) => console.log(error)
        });

        //GET request of network speed from routerAuth

        //GET request of number of antennas from routerAuth
    }

    createRouterFormGroup(): FormGroup {
        return new FormGroup({
            sectionId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            brandId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            model: new FormControl('', [Validators.required]),
            networkSpeedId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            numberOfAntennaId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')])
        });
    }

    //GET
    getLaptopBrandValue() {
        let value = document.getElementById('') as HTMLOptionElement;
        this.routerForm.patchValue({ brandId: parseInt(value.value, 10) });
    }

    getDivisionValue() {
        let value = document.getElementById('division') as HTMLOptionElement;
        this.params.getSectionsById(value.value).subscribe(res => this.fetchedSection = res);
    }

    getSectionValue() {
        let value = document.getElementById('') as HTMLOptionElement;
        this.routerForm.patchValue({ sectionId: parseInt(value.value, 10) });
    }

    //Other functions
    toggleRouterBrandField() {
        this.isRouterBrandToggled = !this.isRouterBrandToggled;
        this.isRouterBrandAnimated = !this.isRouterBrandAnimated;
    }
}
