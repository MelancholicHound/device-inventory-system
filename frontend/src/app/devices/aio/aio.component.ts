import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';

import { ParamsService } from '../../util/services/params.service';
import { SpecsService } from '../../util/services/specs.service';
import { DeviceAioService } from '../../util/services/device-aio.service';

@Component({
    selector: 'app-aio',
    standalone: true,
    imports: [
        NgFor, NgIf,
        ReactiveFormsModule,
        FormsModule
    ],
    providers: [
        ParamsService,
        SpecsService,
        DeviceAioService
    ],
    templateUrl: './aio.component.html',
    styleUrl: './aio.component.scss'
})
export class AioComponent implements OnInit {
    device = { name: 'AIO', indicator: 'aio' };
    deviceCount: any; batchId: any; batchNumber: any;
    procBrandId: any;

    isProcBrandToggled: boolean = false; isProcSeriesToggled: boolean = false;
    isAIOBrandToggled: boolean = false;

    isProcBrandAnimated: boolean = false; isProcSeriesAnimated: boolean = false;
    isAIOBrandAnimated: boolean = false;

    fetchedAIOBrand!: any;
    fetchedDivision!: any; fetchedSection!: any;

    fetchedProcBrand!: any; fetchedProcSeries!: any;
    fetchedRAM!: any; fetchedStorage!: any; fetchedGPU!: any;

    aioForm!: FormGroup;

    constructor(private params: ParamsService,
                private specs: SpecsService,
                private router: Router,
                private aioAuth: DeviceAioService) {
                const navigation = this.router.getCurrentNavigation();
                if (navigation?.extras.state) {
                    this.deviceCount = navigation.extras.state['count'];
                    this.batchNumber = navigation.extras.state['batchnumber'];
                    this.batchId = navigation.extras.state['batchid'];
                }
    }

    ngOnInit(): void {
        this.aioForm = this.createAIOFormGroup();

        this.aioAuth.getAIOBrands().subscribe({
            next: (data: any[]) => { this.fetchedAIOBrand = data },
            error: (error: any) => { console.log(error) }
        });

        this.params.getAllDivisions().subscribe({
            next: (data: any[]) => { this.fetchedDivision = data },
            error: (error: any) => { console.log(error) }
        });

        this.specs.getAllProcBrands().subscribe({
            next: (data: any[]) => { this.fetchedProcBrand = data },
            error: (error: any) => { console.log(error) }
        });

        this.specs.getRAMCapacities().subscribe({
            next: (data: any[]) => { this.fetchedRAM = data },
            error: (error: any) => { console.log(error) }
        });

        this.specs.getStorageCapacities().subscribe({
            next: (data: any[]) => { this.fetchedStorage = data },
            error: (error: any) => { console.log(error) }
        });

        this.specs.getVideoCardCapacities().subscribe({
            next: (data: any[]) => { this.fetchedGPU = data },
            error: (error: any) => { console.log(error) }
        });
    }

    createAIOFormGroup(): FormGroup {
        return new FormGroup({
            batchId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            sectionId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            storageRequests: new FormArray([
                new FormGroup({
                    capacityId: new FormControl([Validators.required, Validators.pattern('^[0-9]*$')]),
                    type: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')])
                })
            ], [Validators.required]),
            ramRequests: new FormArray([
                new FormGroup({ capacityId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]) })
            ], [Validators.required]),
            videoCardRequest: new FormGroup({ capacityId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]) }),
            cpuRequest: new FormGroup({
                cpuBrandId: new FormControl([Validators.required, Validators.pattern('^[0-9]*$')]),
                cpuBrandSeriesId: new FormControl([Validators.required, Validators.pattern('^[0-9]*$')]),
                cpuModifier: new FormControl('', [Validators.required])
            }),
            brandId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            model: new FormControl('', [Validators.required]),
            screenSize: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')])
        });
    }

    //GET
    getAIOBrandValue() {
        let value = document.getElementById('aio-brand') as HTMLOptionElement;
        this.aioForm.get('batchId')?.setValue(value.value);
    }

    getDivisionValue() {
        let value = document.getElementById('division') as HTMLOptionElement;
        this.params.getSectionsById(value.value).subscribe(res => this.fetchedSection = res);
    }

    getSectionValue() {
        let value = document.getElementById('section') as HTMLOptionElement;
        this.aioForm.get('sectionId')?.setValue(value.value);
    }

    getProcBrand() {
        let value = document.getElementById('proc-brand') as HTMLOptionElement;
        this.specs.getProcSeriesById(value.value).subscribe((res: any) => this.fetchedProcSeries = res);
        this.aioForm.get('cpuRequest.cpuBrandId')?.setValue(value.value);
        this.procBrandId = value.value;
    }

    getProcSeries() {
        let value = document.getElementById('proc-series') as HTMLOptionElement;
        this.aioForm.get('cpuRequest.cpuBrandSeriesId')?.setValue(value.value);
    }

    //POST
    onAIOBrandInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
          this.aioAuth.postAIOBrand(inputElement.value).subscribe({
              next: (res: any) => { this.aioForm.get('brandId')?.setValue(res.id) },
              error: (error: any) => { console.log(error) }
          });
        }
    }

    onProcBrandInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.specs.postProcBrand(inputElement.value).subscribe({
                next: (res: any) => { this.aioForm.get('cpuRequest.cpuBrandId')?.setValue(res.id) },
                error: (error: any) => { console.log(error) }
            });
        }
    }

    onProcSeriesInput(id: any, event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.specs.postProcSeries(id, inputElement.value).subscribe({
                next: (res: any) => { this.aioForm.get('cpuRequest.cpuBrandSeriesId')?.setValue(res.id) },
                error: (error: any) => { console.log(error) }
            });
        }
    }

    onProcModiefierInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.aioForm.get('cpuRequest.cpuModifier')?.setValue(inputElement.value);
        }
    }

    onRAMInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            for (let i = 0; i < this.fetchedRAM.length; i++) {
                if (inputElement.value !== this.fetchedRAM[i].capacity) {
                    this.specs.postRAMCapacity(inputElement.value).subscribe({
                        next: (res: any) => {
                            let ramArray = this.aioForm.get('ramRequests') as FormArray;
                            ramArray.push(new FormGroup({ capacityId: new FormControl(res.id, [Validators.required, Validators.pattern('^[0-9]*$')]) }));
                        },
                        error: (error: any) => { console.log(error) }
                    });
                } else if (inputElement.value === this.fetchedRAM[i].capacity) {
                    let ramArray = this.aioForm.get('ramRequests') as FormArray;
                    ramArray.push(new FormGroup({ capacityId: new FormControl(this.fetchedRAM[i].id, [Validators.required, Validators.pattern('^[0-9]*$')]) }));
                }
            }
        }
    }

    onGPUInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            for (let i = 0; i < this.fetchedGPU.length; i++) {
                if (inputElement.value !== this.fetchedGPU[i].capacity) {
                    this.specs.postGPUCapacity(inputElement.value).subscribe({
                        next: (res: any) => {
                            this.aioForm.get('videoCardRequest.capacityId')?.setValue(res.id);
                        },
                        error: (error: any) => { console.log(error) }
                    });
                } else if (inputElement.value === this.fetchedGPU[i].capacity) {
                    this.aioForm.get('videoCardRequest.capacityId')?.setValue(this.fetchedGPU[i].id);
                }
            }
        }
    }

    postAIOSpecs(): void {

    }

    //Other functions
    toggleAIOBrandField() {
        this.isAIOBrandToggled = !this.isAIOBrandToggled;
        this.isAIOBrandAnimated = !this.isAIOBrandAnimated;
    }

    toggleProcBrandField() {
        this.isProcBrandToggled = !this.isProcBrandToggled;
        this.isProcBrandAnimated = !this.isProcBrandAnimated;
    }

    toggleProcSeriesField() {
        this.isProcSeriesToggled = !this.isProcSeriesToggled;
        this.isProcSeriesAnimated = !this.isProcSeriesAnimated;
    }

    addRAM() {
        const ram = document.getElementById('ram');
        const ramSizeField = document.getElementById('ram-field');

        const clonedElement = ramSizeField?.cloneNode(true) as HTMLElement;

        const childCount = ram?.childElementCount;

        ram?.insertBefore(clonedElement, ram.children[childCount! - 1]);
    }

    addStorage() {
        const storage = document.getElementById('storage');

        const storageCap = document.getElementById('storage-size') as HTMLInputElement;
        const storageType = document.getElementById('type') as HTMLOptionElement;

        const storageArray = this.aioForm.get('storageRequests') as FormArray;

        this.specs.getStorageCapacities().subscribe({
            next: (data: any) => {
                let equalData: any;
                for (let i = 0; i < data.length; i++) {
                    if (storageCap.value === data[i].capacity) {
                        equalData = data[i];
                        break;
                    }
                }

                if (equalData) {
                    storageArray.push(new FormGroup({
                        capacityId: new FormControl(equalData.id, [Validators.required]),
                        type: new FormControl(storageType.value, [Validators.required])
                    }));
                } else if (!equalData) {
                    this.specs.postStorageCapacity(storageCap).subscribe({
                        next: (res: any) => {
                            storageArray.push(new FormGroup({
                                capacityId: new FormControl(res.id, [Validators.required]),
                                type: new FormControl(storageType.value, [Validators.required])
                            }));
                        },
                        error: (error: any) => { console.log(error) }
                    });
                }
            },
            error: (error: any) => { console.log(error) }
        });

        const typeContainer = document.getElementById('type-container');
        const sizeContainer = document.getElementById('size-container');

        const clonedTypeEl = typeContainer?.cloneNode(true) as HTMLElement;
        const clonedSizeEl = sizeContainer?.cloneNode(true) as HTMLElement;

        const childCount = storage?.childElementCount;

        storage?.insertBefore(clonedSizeEl, storage.children[childCount! - 1]);
        storage?.insertBefore(clonedTypeEl, storage.children[childCount! - 1]);

    }
}
