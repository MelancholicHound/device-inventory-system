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

    cpuReq = { cpuBrandId: this.procBrandId, cpuBrandSeriesId: this.procSeriesId, cpuModifier: this.procModel };

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
            brandId: new FormControl([Validators.required, Validators.pattern('^[0-9]*$')]),
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

    getAIOBrandValue() {
        let value = document.getElementById('brand-name') as HTMLOptionElement;
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

    saveAIOBrand() {
        let brandInput = document.getElementById('aio-brand-input') as HTMLInputElement;

    }
}
