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

    isProcBrandToggled: boolean = false; isProcSeriesToggled: boolean = false;
    isAIOBrandToggled: boolean = false;

    isProcBrandAnimated: boolean = false; isProcSeriesAnimated: boolean = false;
    isAIOBrandAnimated: boolean = false;

    fetchedAIOBrand!: any;
    fetchedDivision!: any; fetchedSection!: any;

    fetchedProcBrand!: any; fetchedProcSeries!: any;
    fetchedRAM!: any; fetchedStorage!: any; fetchedGPU!: any;

    aioBrandId!: any;
    secId!: any;

    procBrandId!: any; procSeriesId!: any; procModel!: string;
    ramIds!: any[]; storageIds!: any[]; gpuId!: any;
    connsIds!: any[];

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
            batchId: new FormControl(`${this.batchNumber}`, [Validators.required, Validators.pattern('^[0-9]*$')]),
            sectionId: new FormControl(`${this.secId}`, [Validators.required, Validators.pattern('^[0-9]*$')]),
            peripheralIds: new FormArray([], [Validators.required , Validators.pattern('^[0-9]*$')]),
            storageRequests: new FormArray([
                new FormGroup({
                    capacityId: new FormControl([Validators.required, Validators.pattern('^[0-9]*$')]),
                    type: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')])
                })
            ], [Validators.required]),
            ramRequests: new FormArray([
                new FormGroup({ capacityId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]) })
            ], [Validators.required]),
            videoCardRequest: new FormArray([], [Validators.required]),
            cpuRequest: new FormGroup({
                cpuBrandId: new FormControl([Validators.required, Validators.pattern('^[0-9]*$')]),
                cpuBrandSeriesId: new FormControl([Validators.required, Validators.pattern('^[0-9]*$')]),
                cpuModifier: new FormControl('', [Validators.required])
            }),
            brandId: new FormControl(`${this.aioBrandId}`, [Validators.required, Validators.pattern('^[0-9]*$')]),
            deviceSoftwareRequest: new FormGroup({
                operatingSystemId: new FormControl([Validators.pattern('^[0-9]*$')]),
                productivityToolId: new FormControl([Validators.pattern('^[0-9]*$')]),
                securityId: new FormControl([Validators.pattern('^[0-9]*$')])
            }),
            connectionIds: new FormArray([]),
            model: new FormControl('', [Validators.required]),
            screenSize: new FormControl([], [Validators.required, Validators.pattern('^[0-9]*$')])
        });
    }

    //GET
    getAIOBrandValue() {
        let value = document.getElementById('aio-brand') as HTMLOptionElement;
        this.aioBrandId = value.value;
    }

    getDivisionValue() {
        let value = document.getElementById('division') as HTMLOptionElement;
        this.params.getSectionsById(value.value).subscribe(res => this.fetchedSection = res);
    }

    getSectionValue() {
        let value = document.getElementById('section') as HTMLOptionElement;
        this.secId = value.value;
    }

    getProcBrand() {
        let value = document.getElementById('proc-brand') as HTMLOptionElement;
        this.specs.getProcSeriesById(value.value).subscribe((res: any) => this.fetchedProcSeries = res);
        this.procBrandId = value.value;
    }

    getProcSeries() {
        let value = document.getElementById('proc-series') as HTMLOptionElement;
        this.procSeriesId = value.value;
    }

    getSelectedRamId() {
        let input = document.getElementById('ram-size') as HTMLInputElement;
        for (let i = 0; i < this.fetchedRAM.length; i++) {
            if (input.value === this.fetchedRAM[i].capacity) {
                this.ramIds.push(this.fetchedRAM[i].id);
            }
        }
    }

    getSelectedStorageId() {
        let input = document.getElementById('storage-size') as HTMLInputElement;
        for (let i = 0; i < this.fetchedStorage.length; i++) {
            if (input.value === this.fetchedStorage[i].capacity) {
                let array =  { capacityId: this.fetchedStorage[i].id };
                this.storageIds.push(array);
            }
        }
    }

    getGPUId() {
        let input = document.getElementById('gpu-size') as HTMLInputElement;
        for (let i = 0; i < this.fetchedGPU.length; i++) {
            if (input.value === this.fetchedGPU[i].capacity) {
                this.gpuId = this.fetchedGPU[i].id;
            }
        }
    }

    //POST
    onAIOBrandInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
          this.aioAuth.postAIOBrand(inputElement.value).subscribe({
              next: (res: any) => { this.aioBrandId = res.id },
              error: (error: any) => { console.log(error) }
          });
        }
    }

    onProcBrandInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.specs.postProcBrand(inputElement.value).subscribe({
                next: (res: any) => { this.procBrandId = res.id },
                error: (error: any) => { console.log(error) }
            });
        }
    }

    onProcSeriesInput(id: any, event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.specs.postProcSeries(id, inputElement.value).subscribe({
                next: (res: any) => { this.procSeriesId = res.id },
                error: (error: any) => { console.log(error) }
            });
        }
    }

    onRAMInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            for (let i = 0; i < this.fetchedRAM.length; i++) {
                if (inputElement.value !== this.fetchedRAM[i].capacity) {
                    this.specs.postRAMCapacity(inputElement.value).subscribe({
                        next: (res: any) => { this.ramIds.push(res.id) },
                        error: (error: any) => { console.log(error) }
                    });
                } else if (inputElement.value === this.fetchedRAM[i].capacity) {
                    this.ramIds.push(this.fetchedRAM[i].id);
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
                        next: (res: any) => { this.gpuId = res.id },
                        error: (error: any) => { console.log(error) }
                    });
                } else if (inputElement.value === this.fetchedGPU[i].capacity) {
                    this.gpuId = this.fetchedGPU[i].id;
                }
            }
        }
    }

    onStorageInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            for (let i = 0; i < this.fetchedStorage.length; i++) {
                if (inputElement.value !== this.fetchedStorage[i].capacity) {
                    this.specs.postStorageCapacity(inputElement.value).subscribe({
                        next: (res: any) => { this.storageIds.push(res.id) },
                        error: (error: any) => { console.log(error) }
                    });
                } else if (inputElement.value === this.fetchedStorage[i].capacity) {
                    this.storageIds.push(this.fetchedStorage[i].id);
                }
            }
        }
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

    addRam() {
        let ram = document.getElementById('ram');
        let ramSizeField = document.getElementById('ram-field');
        let clonedElement = ramSizeField?.cloneNode(true) as HTMLElement;
        let childCount = ram?.childElementCount;
        ram?.insertBefore(clonedElement, ram.children[childCount! - 1]);
    }
}
