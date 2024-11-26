import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

import { Store } from '@ngrx/store';

import { ParamsService } from '../../util/services/params.service';
import { SpecsService } from '../../util/services/specs.service';
import { DeviceTabletService } from '../../util/services/device-tablet.service';

import { updateChildData } from '../../util/store/app.actions';

@Component({
    selector: 'app-tablet',
    standalone: true,
    imports: [
        NgFor, NgIf,
        ReactiveFormsModule,
        FormsModule
    ],
    providers: [
        ParamsService,
        DeviceTabletService
    ],
    templateUrl: './tablet.component.html',
    styleUrl: './tablet.component.scss'
})
export class TabletComponent implements OnInit {
    device = { name: 'Tablet', indicator: 'tablet' };
    deviceCount!: any; batchId: any; batchNumber: any;

    isChipsetBrandToggled: boolean = false; isChipsetBrandAnimated: boolean = false;
    isTabletBrandToggled: boolean = false; isTabletBrandAnimated: boolean = false;

    fetchedTabletBrand!: any; fetchedChipsetBrand!: any;
    fetchedDivision!: any; fetchedSection!: any;
    fetchedStorage!: any; fetchedRAM!: any;

    tabletForm!: FormGroup;

    constructor(private params: ParamsService,
                private specs: SpecsService,
                private tabletAuth: DeviceTabletService,
                private store: Store) { }

    ngOnInit(): void {
        this.batchId = history.state.batchid;
        this.deviceCount = history.state.count;
        this.batchNumber = history.state.batchnumber;

        this.tabletForm = this.createTabletFormGroup();

        this.tabletAuth.getTabletBrands().subscribe({
            next: (res: any[]) => this.fetchedTabletBrand = res,
            error: (error: any) => console.error(error)
        });

        this.params.getAllDivisions().subscribe({
            next: (res: any[]) => this.fetchedDivision = res,
            error: (error: any) => console.error(error)
        });

        this.tabletAuth.getChipsetBrands().subscribe({
            next: (res: any[]) => this.fetchedChipsetBrand = res,
            error: (error: any) => console.error(error)
        });

        this.specs.getRAMCapacities().subscribe({
            next: (res: any[]) => this.fetchedRAM = res,
            error: (error: any) => console.error(error)
        });

        this.specs.getStorageCapacities().subscribe({
            next: (res: any[]) => this.fetchedStorage = res,
            error: (error: any) => console.error(error)
        });

        if (history.state.devicedetails || history.state.inventorydetails) {
            let payload: any = history.state.devicedetails || history.state.inventorydetails;

            this.tabletForm.patchValue({ brandId: payload.brandDTO.id });
            this.tabletForm.patchValue({ brandSeries: payload.brandSeries });

            this.tabletForm.patchValue({ divisionId: payload.sectionDTO.divisionId });
            this.params.getSectionsByDivisionId(payload.sectionDTO.divisionId).subscribe((res: any[]) => this.fetchedSection = res);
            this.tabletForm.patchValue({ sectionId: payload.sectionDTO.id });

            this.tabletForm.patchValue({ chipsetRequest: { brandId: payload.chipsetDTO.brandDTO.id } });
            this.tabletForm.patchValue({ chipsetRequest: { chipsetModel: payload.chipsetDTO.model } });

            this.tabletForm.patchValue({ screenSize: payload.screenSize });

            let ramInput = document.getElementById('ram-size') as HTMLInputElement;
            let firstStorageSize = document.getElementById('storage-size') as HTMLInputElement;
            ramInput.value = payload.ramDTOs[0].capacityDTO.capacity;
            firstStorageSize.value = payload.storageDTOs[0].capacityDTO.capacity;
        }
    }

    createTabletFormGroup(): FormGroup {
        return new FormGroup({
            batchId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            divisionId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            sectionId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            brandId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            brandSeries: new FormControl(null, [Validators.required]),
            chipsetRequest: new FormGroup({
                brandId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
                chipsetModel: new FormControl(null, [Validators.required])
            }),
            screenSize: new FormControl(null, [Validators.required]),
            storageRequests: new FormArray([], [Validators.required]),
            ramRequests: new FormArray([], [Validators.required])
        });
    }

    //GET
    getTabletBrandValue() {
        let value = document.getElementById('tablet-brand') as HTMLOptionElement;
        this.tabletForm.patchValue({ brandId: parseInt(value.value, 10) });
    }

    getDivisionValue() {
        let value = document.getElementById('division') as HTMLOptionElement;
        this.params.getSectionsByDivisionId(value.value).subscribe((res: any[]) => this.fetchedSection = res)
    }

    getSectionValue() {
        let value = document.getElementById('section') as HTMLOptionElement;
        this.tabletForm.patchValue({ sectionId: parseInt(value.value, 10) });
    }

    getChipsetBrand() {
        let value = document.getElementById('proc-brand') as HTMLOptionElement;
        this.tabletForm.patchValue({ chipsetRequest: { brandId: parseInt(value.value, 10) } });
    }

    //POST
    onTabletBrandInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.tabletAuth.postTabletBrand(inputElement.value).subscribe({
                next: (res: any) => this.tabletForm.patchValue({ brandId: res.id }),
                error: (error: any) => console.error(error)
            });
        }
    }

    onChipsetBrandInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.tabletAuth.postChipsetBrand(inputElement.value).subscribe({
                next: (res: any) => this.tabletForm.patchValue({ chipsetRequest: { brandId: res.id } }),
                error: (error: any) => console.error(error)
            });
        }
    }

    onChipsetModelInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.tabletForm.patchValue({ chipsetRequest: { chipsetModel: inputElement.value } });
        }
    }

    onRAMInput(event: Event): void {
        let inputElement = event.target as HTMLInputElement;
        let ramArray = this.tabletForm.get('ramRequests') as FormArray;

        let matchingRAM = this.fetchedRAM.find((ram: any) => ram.capacity === parseInt(inputElement.value, 10));

        if (matchingRAM) {
            ramArray.push(new FormGroup({
                capacityId: new FormControl(matchingRAM.id, [Validators.required])
            }));
        } else {
            this.specs.postRAMCapacity(inputElement.value).subscribe({
                next: (res: any) => {
                    ramArray.push(new FormGroup({
                        capacityId: new FormControl(res.id, [Validators.required])
                    }));
                },
                error: (error: any) => console.error(error)
            });
        }
    }

    onStorageInput(event: Event): void {
        let inputElement = event.target as HTMLInputElement;
        let storageArray = this.tabletForm.get('storageRequests') as FormArray;

        let matchingStorage = this.fetchedStorage.find((storage: any) => storage.capacity === parseInt(inputElement.value, 10));

        if (matchingStorage) {
            storageArray.push(new FormGroup({
                capacityId: new FormControl(matchingStorage.id, [Validators.required]),
                type: new FormControl('HDD', [Validators.required])
            }));
        } else {
            this.specs.postStorageCapacity(inputElement.value).subscribe({
                next: (res: any) => {
                    storageArray.push(new FormGroup({
                        capacityId: new FormControl(res.id, [Validators.required]),
                        type: new FormControl('HDD', [Validators.required])
                    }));
                },
                error: (error: any) => console.error(error)
            });
        }
    }

    postTabletSpecs(): void {
        this.tabletForm.patchValue({ batchId: this.batchId });
        this.tabletForm.patchValue({ screenSize: String(this.tabletForm.get('screenSize')?.value) });
        this.store.dispatch(updateChildData({ data: this.tabletForm.value }));
    }

    //Other functions
    toggleTabletBrandField() {
        this.isTabletBrandToggled = !this.isTabletBrandToggled;
        this.isTabletBrandAnimated = !this.isTabletBrandAnimated;
    }

    toggleChipsetBrandField() {
        this.isChipsetBrandToggled = !this.isChipsetBrandToggled;
        this.isChipsetBrandAnimated = !this.isChipsetBrandAnimated;
    }
}
