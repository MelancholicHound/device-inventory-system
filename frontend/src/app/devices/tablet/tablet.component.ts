import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

import { ParamsService } from '../../util/services/params.service';
import { DeviceTabletService } from '../../util/services/device-tablet.service';

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
    deviceCount!: any;

    isChipsetBrandToggled: boolean = false; isChipsetBrandAnimated: boolean = false;
    isTabletBrandToggled: boolean = false; isTabletBrandAnimated: boolean = false;

    fetchedTabletBrand!: any; fetchedChipsetBrand!: any;
    fetchedDivision!: any; fetchedSection!: any;
    fetchedStorage!: any; fetchedRAM!: any;

    tabletBrandId!: any;
    secId!: any;

    chipsetBrandId!: any;

    tabletForm!: FormGroup;

    constructor(private params: ParamsService,
                private tabAuth: DeviceTabletService) { }

    ngOnInit(): void {
        this.deviceCount = localStorage.getItem('count');
        if (this.deviceCount) {
            localStorage.removeItem('count');
        }
    }

    getTabletBrandValue() {
        let value = document.getElementById('brand-name') as HTMLOptionElement;
        this.tabletBrandId = value.value;
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
        this.chipsetBrandId = value.value;
    }

    toggleTabletBrandField() {
        this.isTabletBrandToggled = !this.isTabletBrandToggled;
        this.isTabletBrandAnimated = !this.isTabletBrandAnimated;
    }

    toggleChipsetBrandField() {
        this.isChipsetBrandToggled = !this.isChipsetBrandToggled;
        this.isChipsetBrandAnimated = !this.isChipsetBrandAnimated;
    }
}
