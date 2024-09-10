import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

import { ParamsService } from '../../util/services/params.service';
import { DeviceAioService } from '../../util/services/device-aio.service';

@Component({
    selector: 'app-aio',
    standalone: true,
    imports: [
        NgFor,
        NgIf
    ],
    providers: [
        ParamsService,
        DeviceAioService
    ],
    templateUrl: './aio.component.html',
    styleUrl: './aio.component.scss'
})
export class AioComponent implements OnInit {
    device = { name: 'AIO', indicator: 'aio' };
    deviceCount!: any;

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

    cpuReq = { cpurBrandId: this.procBrandId, cpuBrandSeriesId: this.procSeriesId, cpuModifier: this.procModel };

    constructor(private params: ParamsService,
                private aioAuth: DeviceAioService) { }

    ngOnInit(): void {
        this.deviceCount = localStorage.getItem('count');
        if (this.deviceCount) {
            localStorage.removeItem('count');
        }
    }

    forSubmissionAIO(): FormGroup {
        return new FormGroup({
            batchId: new FormControl(''),
            sectionId: new FormControl(`${this.secId}`),
            upsId: new FormControl(''),
            peripheralIds: new FormControl([]),
            storageRequests: new FormControl(`${this.storageIds}`),
            ramIds: new FormControl(`${this.ramIds}`),
            videoCardRequest: new FormControl(`${this.gpuId}`),
            cpuRequest: new FormControl(`${this.cpuReq}`),
            brandId: new FormControl(`${this.aioBrandId}`),
            deviceSoftwarerequest: new FormControl(''),
            connectionIds: new FormControl(`${this.connsIds}`),
            model: new FormControl(``)
        })
    }

    createAIOFormGroup(): FormGroup {
        return new FormGroup({
            aioBrand: new FormControl('', [Validators.required]),
            aioModel: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
            division: new FormControl('', [Validators.required]),
            section: new FormControl('', [Validators.required]),
            procBrand: new FormControl('', [Validators.required]),
            procSeries: new FormControl('', [Validators.required]),
            procModel: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
            ramSize: new FormControl('', [Validators.required]),
            screenSize: new FormControl('', [Validators.required]),
            videoCard: new FormControl('', [Validators.required]),
            storageType: new FormControl('', [Validators.required]),
            storageSize: new FormControl('', [Validators.required])
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
        this.params.getProcSeriesById(value.value).subscribe(res => this.fetchedProcSeries = res);
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
        let ram = document.querySelector('.ram');
        let ramSizeField = document.getElementById('ram-size-field');
        let clonedElement = ramSizeField?.cloneNode(true) as HTMLElement;
        let childCount = ram?.childElementCount;
        ram?.insertBefore(clonedElement, ram.children[childCount! - 1]);
    }
}
