import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';

import { AuthService } from '../../util/services/auth.service';
import { ParamsService } from '../../util/services/params.service';
import { SpecsService } from '../../util/services/specs.service';
import { DeviceComputerService } from '../../util/services/device-computer.service';

import { updateChildData } from '../../util/store/app.actions';

@Component({
    selector: 'app-computer',
    standalone: true,
    imports: [
        NgIf, NgFor,
        ReactiveFormsModule,
        FormsModule
    ],
    providers: [
        AuthService,
        ParamsService,
        SpecsService,
        DeviceComputerService
    ],
    templateUrl: './computer.component.html',
    styleUrl: './computer.component.scss'
})
export class ComputerComponent implements OnInit {
    device = { name: 'Computer', indicator: 'computer' };
    deviceCount!: any; batchId: any; batchNumber: any;
    procBrandId: any; childCount: any;

    isProcBrandToggled: boolean = false; isProcSeriesToggled: boolean = false;
    isProcBrandAnimated: boolean = false; isProcSeriesAnimated: boolean = false;
    isAddingStorage: boolean = false;

    fetchedDivision!: any; fetchedSection!: any;

    fetchedProcBrand!: any; fetchedProcSeries!: any;
    fetchedRAM!: any; fetchedStorage!: any; fetchedGPU!: any;

    computerForm!: FormGroup;

    constructor(private auth: AuthService,
                private params: ParamsService,
                private specs: SpecsService,
                private router: Router,
                private computerAuth: DeviceComputerService,
                private store: Store) { }

    ngOnInit(): void {
        this.batchId = history.state.batchid;
        this.deviceCount = history.state.count;
        this.batchNumber = history.state.batchnumber;

        this.computerForm = this.createCompFormGroup();

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

    createCompFormGroup(): FormGroup {
        return new FormGroup({
            batchId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            sectionId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            storageRequests: new FormArray([], [Validators.required]),
            ramRequests: new FormArray([], [Validators.required]),
            videoCardRequest: new FormGroup({ capacityId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]) }),
            cpuRequest: new FormGroup({
                cpuBrandId: new FormControl([Validators.required, Validators.pattern('^[0-9]*$')]),
                cpuBrandSeriesId: new FormControl([Validators.required, Validators.pattern('^[0-9]*$')]),
                cpuModifier: new FormControl('', [Validators.required])
            })
        });
    }

    //GET
    getDivisionValue() {
        let value = document.getElementById('division') as HTMLOptionElement;
        this.params.getSectionsById(value.value).subscribe(res => this.fetchedSection = res);
    }

    getSectionValue() {
        let value = document.getElementById('section') as HTMLOptionElement;
        this.computerForm.patchValue({ sectionId: parseInt(value.value, 10) });
    }

    getProcBrand() {
        let value = document.getElementById('proc-brand') as HTMLOptionElement;
        this.specs.getProcSeriesById(value.value).subscribe(res => this.fetchedProcSeries = res);
        this.procBrandId = value.value;
        this.computerForm.patchValue({ cpuRequest: { cpuBrandId: parseInt(value.value, 10) } });
    }

    getProcSeries() {
        let value = document.getElementById('proc-series') as HTMLOptionElement;
        this.computerForm.patchValue({ cpuRequest: { cpuBrandSeriesId: parseInt(value.value, 10) } });
    }

    //POST
    onProcBrandInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.specs.postProcBrand(inputElement.value).subscribe({
                next: (res: any) => this.computerForm.patchValue({ cpuRequest: { cpuBrandId: res.id } }),
                error: (error: any) => console.log(error)
            });
        }
    }

    onProcSeriesInput(id: any, event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.specs.postProcSeries(id, inputElement.value).subscribe({
                next: (res: any) => this.computerForm.patchValue({ cpuRequest: { cpuBrandSeriesId: res.id } }),
                error: (error: any) => console.log(error)
            });
        }
    }

    onProcModifierInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.computerForm.patchValue({ cpuRequest: { cpuModifier: inputElement.value } });
        }
    }

    onRAMInput(event: Event): void {
        let inputElement = event.target as HTMLInputElement;
        let intValue = parseInt(inputElement.value, 10);
        let ramArray = this.computerForm.get('ramRequests') as FormArray;

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
                        })
                        break;
                    }
                }
            }
        }
    }

    onGPUInput(event: Event): void {
        let inputElement = event.target as HTMLInputElement;
        let intValue = parseInt(inputElement.value, 10);

        if (intValue) {
            for (let i = 0; i < this.fetchedGPU.length; i++) {
                if (intValue === this.fetchedGPU[i].capacity) {
                    this.computerForm.get('videoCardRequest')?.setValue({ capacityId: this.fetchedGPU[i].id });
                    break;
                } else if (intValue !== this.fetchedGPU[i].capacity) {
                    if (i === this.fetchedGPU.length) {
                        this.specs.postGPUCapacity(intValue).subscribe({
                            next: (res: any) => this.computerForm.get('videoCardRequest')?.setValue({ capacityId: res.id }),
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
        let storageArray = this.computerForm.get('storageRequests') as FormArray;

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

    postCompSpecs(): void {
        this.computerForm.patchValue({ batchId: this.batchId });
        this.store.dispatch(updateChildData({ data: this.computerForm.value }));
    }

    //Other functions
    toggleProcBrandField() {
        this.isProcBrandToggled = !this.isProcBrandToggled;
        this.isProcBrandAnimated = !this.isProcBrandAnimated;
    }

    toggleProcSeriesField() {
        this.isProcSeriesToggled = !this.isProcSeriesToggled;
        this.isProcSeriesAnimated = !this.isProcSeriesAnimated;
    }

    addRam() {
        let ram = document.getElementById('ram');
        let ramSizeField = document.getElementById('ram-field');
        let clonedElement = ramSizeField?.cloneNode(true) as HTMLElement;
        let childCount = ram?.childElementCount;

        const newId = `ram-size-${childCount}`;

        const clonedInput = clonedElement.querySelector('input');
        if (clonedInput) {
            clonedInput.id = newId; clonedInput.value = '';

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
        this.childCount = storage?.childElementCount;

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
