import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Store } from '@ngrx/store';

import { ParamsService } from '../../util/services/params.service';
import { DeviceRouterService } from '../../util/services/device-router.service';

import { updateChildData } from '../../util/store/app.actions';

@Component({
    selector: 'app-router',
    standalone: true,
    imports: [
        CommonModule,
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
    deviceCount!: any; batchNumber: any;
    fromComputerInventory: any;

    isRouterBrandToggled: boolean = false; isRouterBrandAnimated: boolean = false;

    fetchedRouterBrand!: any; fetchedNetSpeed!: any; fetchedAntenna!: any;
    fetchedDivision!: any; fetchedSection!: any;

    routerForm!: FormGroup;

    constructor(private params: ParamsService,
                private routerAuth: DeviceRouterService,
                private store: Store) { }

    ngOnInit(): void {
        this.deviceCount = history.state.count;
        this.fromComputerInventory = history.state.inventorydetails;
        this.batchNumber = history.state.batchnumber;

        this.routerForm = this.createRouterFormGroup();

        this.routerAuth.getRouterBrands().subscribe({
            next: (data: any[]) => this.fetchedRouterBrand = data,
            error: (error: any) => console.error(error)
        });

        this.params.getAllDivisions().subscribe({
            next: (data: any[]) => this.fetchedDivision = data,
            error: (error: any) => console.error(error)
        });

        this.routerAuth.getNetworkSpeed().subscribe({
            next: (data: any[]) => this.fetchedNetSpeed = data,
            error: (error: any) => console.error(error)
        });

        this.routerAuth.getNumberOfAntennas().subscribe({
            next: (data: any[]) => this.fetchedAntenna = data,
            error: (error: any) => console.error(error)
        });

        if (history.state.devicedetails || history.state.inventorydetails) {
            let payload: any = history.state.devicedetails || history.state.inventorydetails;

            this.routerForm.patchValue({ brandId: payload.brandDTO.id });
            this.routerForm.patchValue({ model: payload.model });

            this.routerForm.patchValue({ divisionId: payload.sectionDTO.divisionId });
            this.params.getSectionsByDivisionId(payload.sectionDTO.divisionId).subscribe((res: any[]) => this.fetchedSection = res);
            this.routerForm.patchValue({ sectionId: payload.sectionDTO.id });

            this.routerForm.patchValue({ networkSpeedId: payload.networkSpeedDTO.networkSpeedByMbps });
            this.routerForm.patchValue({ numberOfAntennaId: payload.antennaDTO.numberOfAntenna });
        }
    }

    createRouterFormGroup(): FormGroup {
        return new FormGroup({
            batchId: new FormControl(history.state.batchid, [Validators.required, Validators.pattern('^[0-9]*$')]),
            divisionId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            sectionId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            brandId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            model: new FormControl(null, [Validators.required]),
            networkSpeedId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            numberOfAntennaId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')])
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
                error: (error: any) => console.error(error)
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
                            error: (error: any) => console.error(error)
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
                            error: (error: any) => console.error(error)
                        });
                    }
                }
            }
        }
    }

    postRouterSpecs(): void {
        this.routerForm.removeControl('divisionId');
        this.store.dispatch(updateChildData({ data: this.routerForm.value }));
    }

    //Other functions
    toggleRouterBrandField() {
        this.isRouterBrandToggled = !this.isRouterBrandToggled;
        this.isRouterBrandAnimated = !this.isRouterBrandAnimated;
    }
}
