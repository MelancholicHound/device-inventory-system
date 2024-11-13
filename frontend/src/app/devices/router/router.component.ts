import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';

import { ParamsService } from '../../util/services/params.service';
import { DeviceRouterService } from '../../util/services/device-router.service';

import { updateChildData } from '../../util/store/app.actions';

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
                private routerAuth: DeviceRouterService,
                private store: Store) { }

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

        this.routerAuth.getNetworkSpeed().subscribe({
            next: (data: any[]) => this.fetchedNetSpeed = data,
            error: (error: any) => console.log(error)
        });

        this.routerAuth.getNumberOfAntennas().subscribe({
            next: (data: any[]) => this.fetchedAntenna = data,
            error: (error: any) => console.log(error)
        });
    }

    createRouterFormGroup(): FormGroup {
        return new FormGroup({
            batchId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            sectionId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            brandId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            model: new FormControl('', [Validators.required]),
            networkSpeedId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            numberOfAntennaId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')])
        });
    }

    //GET
    getRouterBrandValue() {
        let value = document.getElementById('router-brand') as HTMLOptionElement;
        this.routerForm.patchValue({ brandId: parseInt(value.value, 10) });
    }

    getDivisionValue() {
        let value = document.getElementById('division') as HTMLOptionElement;
        this.params.getSectionsByDivisionId(value.value).subscribe((res: any[]) => this.fetchedSection = res);
    }

    getSectionValue() {
        let value = document.getElementById('section') as HTMLOptionElement;
        this.routerForm.patchValue({ sectionId: parseInt(value.value, 10) });
    }

    //POST
    onRouterBrandInput(event: Event): void {
        let inputElement = event.target as HTMLInputElement;

        if (inputElement.value !== '') {
            this.routerAuth.postRouterBrandInput(inputElement.value).subscribe({
                next: (res: any) => this.routerForm.patchValue({ brandId: res.id }),
                error: (error: any) => console.log(error)
            });
        }
    }

    onNetworkSpeedInput(event: Event): void {
        let inputElement = event.target as HTMLInputElement;
        let intValue = parseInt(inputElement.value, 10);

        if (intValue) {
            for (let i = 0; i < this.fetchedNetSpeed.length; i++) {
                if (intValue === this.fetchedNetSpeed[i].networkSpeedByMbps) {
                    this.routerForm.patchValue({ networkSpeedId: this.fetchedNetSpeed[i].id });
                    break;
                } else if (intValue !== this.fetchedNetSpeed[i].networkSpeedByMbps) {
                    if (i === this.fetchedNetSpeed.length) {
                        this.routerAuth.postRouterBrandInput(intValue).subscribe({
                            next: (res: any) => this.routerForm.patchValue({ networkSpeedId: res.id }),
                            error: (error: any) => console.log(error)
                        });
                    }
                }
            }
        }
    }

    onAntennasInput(event: Event): void {
        let inputElement = event.target as HTMLInputElement;
        let intValue = parseInt(inputElement.value, 10);

        if (intValue) {
            for (let i = 0; i < this.fetchedAntenna.length; i++) {
                if (intValue === this.fetchedAntenna[i].numberOfAntenna) {
                    this.routerForm.patchValue({ numberOfAntennaId: this.fetchedAntenna[i].id });
                    break;
                } else if (intValue !== this.fetchedAntenna[i].numberOfAntenna) {
                    if (i === this.fetchedAntenna.length) {
                        this.routerAuth.postNumberOfAntennas(intValue).subscribe({
                            next: (res: any) => this.routerForm.patchValue({ numberOfAntennaId: res.id }),
                            error: (error: any) => console.log(error)
                        });
                    }
                }
            }
        }
    }

    postRouterSpecs(): void {
        this.routerForm.patchValue({ batchId: this.batchId });
        this.store.dispatch(updateChildData({ data: this.routerForm.value }));
    }

    //Other functions
    toggleRouterBrandField() {
        this.isRouterBrandToggled = !this.isRouterBrandToggled;
        this.isRouterBrandAnimated = !this.isRouterBrandAnimated;
    }
}
