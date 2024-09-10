import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

import { ParamsService } from '../../util/services/params.service';
import { DeviceRouterService } from '../../util/services/device-router.service';

@Component({
    selector: 'app-router',
    standalone: true,
    imports: [
        NgFor, NgIf,
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
    deviceCount!: any;

    isRouterBrandToggled: boolean = false; isRouterBrandAnimated: boolean = false;

    fetchedRouterBrand!: any;
    fetchedDivision!: any; fetchedSection!: any;

    routerBrandId!: any;
    secId!: any;

    routerForm!: FormGroup;

    constructor(private params: ParamsService,
                private routeAuth: DeviceRouterService) { }

    ngOnInit(): void {
        this.deviceCount = localStorage.getItem('count');
        if (this.deviceCount) {
            localStorage.removeItem('count');
        }
    }

    getRouterBrandValue() {
        let value = document.getElementById('brand-name') as HTMLOptionElement;
        this.routerBrandId = value.value;
    }

    getDivisionValue() {
        let value = document.getElementById('division') as HTMLOptionElement;
        this.params.getSectionsById(value.value).subscribe(res => this.fetchedSection = res);
    }

    getSectionValue() {
        let value = document.getElementById('section') as HTMLOptionElement;
        this.secId = value.value;
    }

    getPrinterType() {

    }

    toggleRouterBrandField() {
        this.isRouterBrandToggled = !this.isRouterBrandToggled;
        this.isRouterBrandAnimated = !this.isRouterBrandAnimated;
    }
}
