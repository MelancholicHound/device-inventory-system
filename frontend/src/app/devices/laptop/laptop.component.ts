import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

import { ParamsService } from '../../util/services/params.service';

@Component({
    selector: 'app-laptop',
    standalone: true,
    imports: [
        NgFor, NgIf,
        ReactiveFormsModule,
        FormsModule
    ],
    templateUrl: './laptop.component.html',
    styleUrl: './laptop.component.scss'
})
export class LaptopComponent implements OnInit {
    device =  { name: 'Laptop', indicator: 'laptop' };
    deviceCount!: any;

    isProcBrandToggled: boolean = false; isProcSeriesToggled: boolean = false;
    isLaptopBrandToggled: boolean = false;

    isProcBrandAnimated: boolean = false; isProcSeriesAnimated: boolean = false;
    isLaptopBrandAnimated: boolean = false;

    fetchedLaptopBrand!: any;
    fetchedDivision!: any; fetchedSection!: any;

    fetchedProcBrand!: any; fetchedProcSeries!: any;
    fetchedRAM!: any; fetchedStorage!: any; fetchedGPU!: any;

    laptopBrandId!: any;
    secId!: any;

    procBrandId!: any; procSeriesId!: any; procModel!: string;
    ramIds!: any[]; storageIds!: any[]; gpuId!: any;
    connsIds!: any[];

    laptopForm!: FormGroup;

    cpuReq = { cpuBrandId: this.procBrandId, cpuBrandSeriesId: this.procSeriesId, cpuModifier: this.procModel };

    constructor(private params: ParamsService) { }

    ngOnInit(): void {
        this.deviceCount = localStorage.getItem('count');
        if (this.deviceCount) {
            localStorage.removeItem('count');
        }
    }

    getLaptopBrandValue() {
        let value = document.getElementById('brand-name') as HTMLOptionElement;
        this.laptopBrandId = value.value;
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
        let ram = document.getElementById('ram');
        let ramSizeField = document.getElementById('ram-field');
        let clonedElement = ramSizeField?.cloneNode(true) as HTMLElement;
        let childCount = ram?.childElementCount;
        ram?.insertBefore(clonedElement, ram.children[childCount! - 1]);
    }
}
