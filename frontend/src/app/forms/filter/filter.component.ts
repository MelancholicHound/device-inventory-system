import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ParamsService } from '../../util/services/params.service';
import { SpecsService } from '../../util/services/specs.service';
import { DeviceAioService } from '../../util/services/device-aio.service';
import { DeviceLaptopService } from '../../util/services/device-laptop.service';
import { DevicePrinterService } from '../../util/services/device-printer.service';
import { DeviceRouterService } from '../../util/services/device-router.service';
import { DeviceScannerService } from '../../util/services/device-scanner.service';
import { DeviceTabletService } from '../../util/services/device-tablet.service';


@Component({
    selector: 'app-filter',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        FormsModule,
        CommonModule
    ],
    providers: [
        SpecsService,
        ParamsService,
        DeviceAioService,
        DeviceLaptopService,
        DevicePrinterService,
        DeviceRouterService,
        DeviceScannerService,
        DeviceTabletService
    ],
    templateUrl: './filter.component.html',
    styleUrl: './filter.component.scss'
})
export class FilterComponent implements OnInit {
    @Output() filter = new EventEmitter<any>();

    device = [
        { name: 'Computer', indicator: 'computer' },
        { name: 'Laptop', indicator: 'laptop' },
        { name: 'Tablet', indicator: 'tablet' },
        { name: 'AIO', indicator: 'aio' },
        { name: 'Printer', indicator: 'printer' },
        { name: 'Scanner', indicator: 'scanner' },
        { name: 'Router', indicator: 'router' }
    ];

    filterForm!: FormGroup;

    fetchedAIOBrand!: any; fetchedLaptopBrand!: any; fetchedTabletBrand!: any;
    fetchedPrinterBrand!: any; fetchedScannerBrand!: any; fetchedRouterBrand!: any;

    fetchedScannerType!: any;

    fetchedBatch: any;
    fetchedDivision: any; fetchedSection: any;
    fetchedRAM!: any; fetchedStorage!: any; fetchedGPU!: any;
    fetchedAntennas!: any; fetchedSpeed!: any;

    constructor(private params: ParamsService,
                private specs: SpecsService,
                private aioAuth: DeviceAioService,
                private laptopAuth: DeviceLaptopService,
                private printerAuth: DevicePrinterService,
                private routerAuth: DeviceRouterService,
                private scannerAuth: DeviceScannerService,
                private tabletAuth: DeviceTabletService) {
                this.filterForm = this.createFilterForm();
    }

    ngOnInit(): void {
        this.params.getAllBatches().subscribe({
            next: (res: any) => this.fetchedBatch = res,
            error: (error: any) => console.error(error)
        });

        this.params.getAllDivisions().subscribe({
            next: (res: any) => this.fetchedDivision = res,
            error: (error: any) => console.error(error)
        });

        this.specs.getRAMCapacities().subscribe({
            next: (res: any) => this.fetchedRAM = res,
            error: (error: any) => console.error(error)
        });

        this.specs.getStorageCapacities().subscribe({
            next: (res: any) => this.fetchedStorage = res,
            error: (error: any) => console.error(error)
        });

        this.specs.getVideoCardCapacities().subscribe({
            next: (res: any) => this.fetchedGPU = res,
            error: (error: any) => console.error(error)
        });

        this.aioAuth.getAIOBrands().subscribe({
            next: (res: any) => this.fetchedAIOBrand = res,
            error: (error: any) => console.error(error)
        });

        this.laptopAuth.getLaptopBrands().subscribe({
            next: (res: any) => this.fetchedLaptopBrand = res,
            error: (error : any) => console.error(error)
        });

        this.printerAuth.getPrinterBrands().subscribe({
            next: (res: any) => this.fetchedPrinterBrand = res,
            error: (error: any) => console.error(error)
        });

        this.routerAuth.getRouterBrands().subscribe({
            next: (res: any) => this.fetchedRouterBrand = res,
            error: (error: any) => console.error(error)
        })

        this.scannerAuth.getScannerBrands().subscribe({
            next: (res: any) => this.fetchedScannerBrand = res,
            error: (error: any) => console.error(error)
        });

        this.tabletAuth.getTabletBrands().subscribe({
            next: (res: any) => this.fetchedTabletBrand = res,
            error: (error: any) => console.error(error)
        });


        this.scannerAuth.getScannerType().subscribe({
            next: (res: any) => this.fetchedScannerType = res,
            error: (error: any) => console.error(error)
        });

        this.routerAuth.getNetworkSpeed().subscribe({
            next: (res: any) => this.fetchedSpeed = res,
            error: (error: any) => console.error(error)
        });

        this.routerAuth.getNumberOfAntennas().subscribe({
            next: (res: any) => this.fetchedAntennas = res,
            error: (error: any) => console.error(error)
        });
    }

    createFilterForm(): FormGroup {
        return new FormGroup({
            device: new FormControl(null),
            batchId: new FormControl(null),
            divisionId: new FormControl(null),
            sectionId: new FormControl(null),
            condemned: new FormControl(null),
            brandId: new FormControl(null),
            model: new FormControl(null),
            storageCapacityId: new FormControl(null),
            ramCapacityId: new FormControl(null),
            videoCardCapacityId: new FormControl(null),
            screenSize: new FormControl(null),
            printerTypeId: new FormControl(null),
            isWithScanner: new FormControl(false),
            networkSpeedId: new FormControl(null),
            numberOfAntennasId: new FormControl(null),
            scannerTypeId: new FormControl(null)
        });
    }

    getSection(event: Event): void {
        let selectElement = event.target as HTMLSelectElement;

        this.params.getSectionsByDivisionId(selectElement.value).subscribe({
            next: (res: any) => this.fetchedSection = res,
            error: (error: any) => console.error(error)
        });
    }

    private updateCapacities(event: Event, fetchedData: any[], formControlName: string, capacityKey: string = 'capacity'): void {
        const inputElement = event.target as HTMLInputElement;
        const matchedPayload = fetchedData.find(value => value[capacityKey] === parseInt(inputElement.value, 10));

        if (matchedPayload) {
            this.filterForm.patchValue({ [formControlName]: parseInt(matchedPayload.id, 10) });
        }
    }

    getStorage(event: Event): void {
        this.updateCapacities(event, this.fetchedStorage, 'storageCapacityId');
    }

    getRAM(event: Event): void {
        this.updateCapacities(event, this.fetchedRAM, 'ramCapacityId');
    }

    getGPU(event: Event): void {
        this.updateCapacities(event, this.fetchedGPU, 'videoCardCapacityId');
    }

    getSpeed(event: Event): void {
        this.updateCapacities(event, this.fetchedSpeed, 'networkSpeedId', 'networkSpeedByMbps');
    }

    getAntennas(event: Event): void {
        this.updateCapacities(event, this.fetchedAntennas, 'numberOfAntennasId', 'numberOfAntenna');
    }

    submitFilter() {
        console.log(this.filterForm.value);
        if (this.filterForm.get('brandId')?.value) this.filterForm.patchValue({ brandId: parseInt(this.filterForm.get('brandId')?.value, 10) });
        if (this.filterForm.get('divisionId')?.value) this.filterForm.patchValue({ divisionId: parseInt(this.filterForm.get('divisionId')?.value, 10) });
        if (this.filterForm.get('sectionId')?.value) this.filterForm.patchValue({ sectionId: parseInt(this.filterForm.get('sectionId')?.value, 10) });
        if (this.filterForm.get('batchId')?.value) this.filterForm.patchValue({ batchId: parseInt(this.filterForm.get('batchId')?.value, 10) });

        this.filter.emit(this.filterForm.value);
        this.filterForm.reset();
    }
}
