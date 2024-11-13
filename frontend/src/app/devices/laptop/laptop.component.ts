import { Component, EventEmitter, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';

import { AuthService } from '../../util/services/auth.service';
import { ParamsService } from '../../util/services/params.service';
import { SpecsService } from '../../util/services/specs.service';
import { DeviceLaptopService } from '../../util/services/device-laptop.service';

import { updateChildData } from '../../util/store/app.actions';

@Component({
    selector: 'app-laptop',
    standalone: true,
    imports: [
        NgFor, NgIf,
        ReactiveFormsModule,
        FormsModule
    ],
    providers: [
        ParamsService,
        SpecsService,
        DeviceLaptopService
    ],
    templateUrl: './laptop.component.html',
    styleUrl: './laptop.component.scss'
})
export class LaptopComponent implements OnInit {
    device =  { name: 'Laptop', indicator: 'laptop' };
    deviceCount!: any; batchId: any; batchNumber: any;
    procBrandId: any; childCount: any;

    isProcBrandToggled: boolean = false; isProcSeriesToggled: boolean = false;
    isLaptopBrandToggled: boolean = false; isAddingStorage: boolean = false;

    isProcBrandAnimated: boolean = false; isProcSeriesAnimated: boolean = false;
    isLaptopBrandAnimated: boolean = false;

    fetchedLaptopBrand!: any;
    fetchedDivision!: any; fetchedSection!: any;

    fetchedProcBrand!: any; fetchedProcSeries!: any;
    fetchedRAM!: any; fetchedStorage!: any; fetchedGPU!: any;

    laptopForm!: FormGroup;

    constructor(private auth: AuthService,
                private params: ParamsService,
                private specs: SpecsService,
                private router: Router,
                private laptopAuth: DeviceLaptopService,
                private store: Store) {}

    ngOnInit(): void {
        this.batchId = history.state.batchid;
        this.deviceCount = history.state.count;
        this.batchNumber = history.state.batchnumber;

        this.laptopForm = this.createLaptopFormGroup();

        this.laptopAuth.getLaptopBrands().subscribe({
            next: (data: any[]) => this.fetchedLaptopBrand = data,
            error: (error: any) => console.log(error)
        });

        this.params.getAllDivisions().subscribe({
            next: (data: any[]) => this.fetchedDivision = data,
            error: (error: any) => console.log(error)
        });

        this.specs.getAllProcBrands().subscribe({
            next: (data: any[]) => this.fetchedProcBrand = data,
            error: (error: any) => console.log(error)
        });

        this.specs.getRAMCapacities().subscribe({
            next: (data: any[]) => this.fetchedRAM = data,
            error: (error: any) => console.log(error)
        });

        this.specs.getStorageCapacities().subscribe({
            next: (data: any[]) => this.fetchedStorage = data,
            error: (error: any) => console.log(error)
        });

        this.specs.getVideoCardCapacities().subscribe({
            next: (data: any[]) => this.fetchedGPU = data,
            error: (error: any) => console.log(error)
        });
    }

    createLaptopFormGroup(): FormGroup {
        return new FormGroup({
            batchId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            sectionId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            storageRequests: new FormArray([], [Validators.required]),
            ramRequests: new FormArray([], [Validators.required]),
            videoCardRequest: new FormGroup({ capacityId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]) }),
            cpuRequest: new FormGroup({
                cpurBrandId: new FormControl([Validators.required, Validators.pattern('^[0-9]*$')]),
                cpuBrandSeriesId: new FormControl([Validators.required, Validators.pattern('^[0-9]*$')]),
                cpuModifier: new FormControl('', [Validators.required])
            }),
            brandId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            model: new FormControl('', [Validators.required]),
            screenSize: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')])
        });
    }

    //GET
    getLaptopBrandValue() {
        let value = document.getElementById('laptop-brand') as HTMLOptionElement;
        this.laptopForm.patchValue({ brandId: parseInt(value.value, 10) });
    }

    getDivisionValue() {
        let value = document.getElementById('division') as HTMLOptionElement;
        this.params.getSectionsByDivisionId(value.value).subscribe((res: any[]) => this.fetchedSection = res);
    }

    getSectionValue() {
        let value = document.getElementById('section') as HTMLOptionElement;
        this.laptopForm.patchValue({ sectionId: parseInt(value.value, 10) });
    }

    getProcBrand() {
        let value = document.getElementById('proc-brand') as HTMLOptionElement;
        this.specs.getProcSeriesById(value.value).subscribe(res => this.fetchedProcSeries = res);
        this.procBrandId = value.value;
        this.laptopForm.patchValue({ cpuRequest: { cpuBrandId: parseInt(value.value, 10) } });
    }

    getProcSeries() {
        let value = document.getElementById('proc-series') as HTMLOptionElement;
        this.laptopForm.patchValue({ cpuRequest: { cpuBrandSeriesId: parseInt(value.value, 10) } });
    }

    //POST
    onLaptopBrandInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.laptopAuth.postLaptopBrand(inputElement.value).subscribe({
                next: (res: any) => this.laptopForm.patchValue({ brandId: res.id }),
                error: (error: any) => console.log(error)
            });
        }
    }

    onProcBrandInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.specs.postProcBrand(inputElement.value).subscribe({
                next: (res: any) => this.laptopForm.patchValue({ cpuRequest: { cpuBrandId: res.id } }),
                error: (error: any) => console.log(error)
            });
        }
    }

    onProcSeriesInput(id: any, event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.specs.postProcSeries(id, inputElement.value).subscribe({
                next: (res: any) => this.laptopForm.patchValue({ cpuRequest: { cpuBrandSeriesId: res.id } }),
                error: (error: any) => console.log(error)
            });
        }
    }

    onProcModifierInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.laptopForm.patchValue({ cpuRequest: { cpuModifier: inputElement.value } });
        }
    }

    onRAMInput(event: Event): void {
        let inputElement = event.target as HTMLInputElement;
        let intValue = parseInt(inputElement.value, 10);
        let ramArray = this.laptopForm.get('ramRequests') as FormArray;

        if (intValue) {
            for (let i = 0; i < this.fetchedRAM.length; i++) {
                if (intValue === this.fetchedRAM[i].capacity) {
                    ramArray.push(new FormGroup({
                        capacityId: new FormControl(this.fetchedRAM[i].id, [Validators.required, Validators.pattern('^[0-9]*$')])
                    }));
                    break;
                } else if (intValue !== this.fetchedRAM[i].capacity) {
                    if (i === this.fetchedRAM.length) {
                        this.specs.postRAMCapacity(intValue).subscribe({
                            next: (res: any) => {
                                ramArray.push(new FormGroup({
                                    capacityId: new FormControl(res.id, [Validators.required, Validators.pattern('^[0-9]*$')])
                                }));
                            },
                            error: (error: any) => console.log(error)
                        });
                    }
                }
            }
        }
    }

    onGPUInput(event: Event): void {
        let inputElement = event.target as HTMLInputElement;
        let intValue = parseInt(inputElement.value, 10);

        if (intValue) {
            for (let i = 9; i < this.fetchedGPU.length; i++) {
                if (intValue === this.fetchedGPU[i].capacity) {
                    this.laptopForm.get('videoCardRequest')?.setValue({ capacityId: this.fetchedGPU[i].id });
                    break;
                } else if (intValue !== this.fetchedGPU[i].capacity) {
                    if (i === this.fetchedGPU.length) {
                        this.specs.postGPUCapacity(intValue).subscribe({
                            next: (res: any) => this.laptopForm.get('videoCardRequest')?.setValue({ capacityId: res.id }),
                            error: (error: any) => console.log(error)
                        });
                    }
                }
            }
        }
    }

    onStorageInput(event: Event): void {
        let inputElement = event.target as HTMLInputElement;
        let typeSelect = document.getElementById('type') as HTMLSelectElement;
        let sizeValue = parseInt(inputElement.value, 10);
        let storageArray = this.laptopForm.get('storageRequests') as FormArray;

        if (sizeValue && typeSelect.value) {
            for (let i = 0; i < this.fetchedStorage.length; i++) {
                if (sizeValue === this.fetchedStorage[i].capacity) {
                    if (this.childCount) {
                        let typeSelectIndex = document.getElementById(`type-${this.childCount}`) as HTMLSelectElement;
                        storageArray.push(new FormGroup({
                            capacityId: new FormControl(this.fetchedStorage[i].id, [Validators.required]),
                            type: new FormControl(typeSelectIndex.value, [Validators.required])
                        }));
                        this.childCount = null;
                        break;
                    } else {
                        storageArray.push(new FormGroup({
                            capacityId: new FormControl(this.fetchedStorage[i].id, [Validators.required]),
                            type: new FormControl(typeSelect.value, [Validators.required])
                        }));
                        break;
                    }
                } else if (sizeValue !== this.fetchedStorage[i].capacity) {
                    if (i === this.fetchedStorage.length) {
                        this.specs.postStorageCapacity(sizeValue).subscribe({
                            next: (res: any) => {
                                storageArray.push(new FormGroup({
                                    capacityId: new FormControl(res.id, [Validators.required]),
                                    type: new FormControl(typeSelect.value, [Validators.required])
                                }));
                            },
                            error: (error: any) => console.log(error)
                        });
                    }
                }
            }
        }
    }

    postLaptopSpecs(): void {
        this.laptopForm.patchValue({ batchId: this.batchId });
        this.store.dispatch(updateChildData({ data: this.laptopForm.value }));
    }

    //Other function
    toggleLaptopBrandField() {
        this.isLaptopBrandToggled = !this.isLaptopBrandToggled;
        this.isLaptopBrandAnimated = !this.isLaptopBrandAnimated;
    }

    toggleProcBrandField() {
        this.isProcBrandToggled = !this.isProcBrandToggled;
        this.isProcBrandAnimated = !this.isProcBrandAnimated;
    }

    toggleProcSeriesField() {
        this.isProcSeriesToggled = !this.isProcSeriesToggled;
        this.isProcSeriesAnimated = !this.isProcSeriesAnimated;
    }

    addRam() {
        const ram = document.getElementById('ram');
        const ramSizeField = document.getElementById('ram-field');
        const clonedElement = ramSizeField?.cloneNode(true) as HTMLElement;
        const childCount = ram?.childElementCount;

        const newId = `ram-size-${childCount}`;

        const clonedInput = clonedElement.querySelector('input');
        if (clonedInput) {
            clonedInput.id = newId;
            clonedInput.value = '';

            clonedInput.addEventListener('blur', (event) => this.onRAMInput(event));
        }

        ram?.insertBefore(clonedElement, ram.children[childCount! - 1]);
    }

    addStorage() {
        const storage = document.getElementById('storage');
        const typeContainer = document.getElementById('type-container');
        const sizeContainer = document.getElementById('size-container');

        const clonedTypeEl = typeContainer?.cloneNode(true) as HTMLElement;
        const clonedSizeEl = sizeContainer?.cloneNode(true) as HTMLElement;

        const newIdSize = `storage-size-${this.childCount}`;
        const newIdType = `type-${this.childCount}`;

        const clonedTypeSelect = clonedTypeEl.querySelector('select');
        const clonedSizeInput = clonedSizeEl.querySelector('input');
        if (clonedTypeSelect && clonedSizeInput) {
            clonedTypeSelect.id = newIdType; clonedSizeInput.id = newIdSize;
            clonedTypeSelect.value = ''; clonedSizeInput.value = '';

            clonedSizeInput.addEventListener('blur', (event) => this.onStorageInput(event));
        }

        storage?.insertBefore(clonedTypeEl, storage.children[storage?.childElementCount! - 1]);
        storage?.insertBefore(clonedSizeEl, storage.children[storage?.childElementCount! - 1]);
    }
}
