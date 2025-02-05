import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { forkJoin } from 'rxjs';

import { ParamsService } from '../../util/services/params.service';
import { SpecsService } from '../../util/services/specs.service';
import { NotificationService } from '../../util/services/notification.service';
import { DeviceAioService } from '../../util/services/device-aio.service';
import { DeviceComputerService } from '../../util/services/device-computer.service';
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
        NotificationService,
        DeviceAioService,
        DeviceComputerService,
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

    deviceObject = [
        { key: 'COMP', name: 'Computer', indicator: 'computer', service: this.computerAuth },
        { key: 'LAP', name: 'Laptop', indicator: 'laptop', service: this.laptopAuth },
        { key: 'TAB', name: 'Tablet', indicator: 'tablet', service: this.tabletAuth },
        { key: 'AIO', name: 'AIO', indicator: 'aio', service: this.aioAuth },
        { key: 'PRNT', name: 'Printer', indicator: 'printer', service: this.printerAuth },
        { key: 'SCAN', name: 'Scanner', indicator: 'scanner', service: this.scannerAuth },
        { key: 'RT', name: 'Router', indicator: 'router', service: this.routerAuth }
    ];

    filterForm!: FormGroup;

    fetchedDevices!: any; fetchedSuppliers!: any;
    fetchedAIOBrand!: any; fetchedLaptopBrand!: any; fetchedTabletBrand!: any;
    fetchedPrinterBrand!: any; fetchedScannerBrand!: any; fetchedRouterBrand!: any;

    fetchedScannerType!: any;

    fetchedBatch: any;
    fetchedDivision: any; fetchedSection: any;
    fetchedRAM!: any; fetchedStorage!: any; fetchedGPU!: any;
    fetchedAntennas!: any; fetchedSpeed!: any;

    constructor(private params: ParamsService,
                private specs: SpecsService,
                private notification: NotificationService,
                private aioAuth: DeviceAioService,
                private computerAuth: DeviceComputerService,
                private laptopAuth: DeviceLaptopService,
                private printerAuth: DevicePrinterService,
                private routerAuth: DeviceRouterService,
                private scannerAuth: DeviceScannerService,
                private tabletAuth: DeviceTabletService) {
                this.filterForm = this.createFilterForm();

                forkJoin([
                    ...this.deviceObject.map(device => device.service.getAllActiveDevice()),
                    ...this.deviceObject.map(device => device.service.getAllCondemnedDevice())
                ]).subscribe({
                    next: (result: any[]) => this.fetchedDevices = result.flat(),
                    error: (error: any) => this.notification.showError(error)
                });
    }

    ngOnInit(): void {
        this.params.getAllBatches().subscribe({
            next: (res: any) => this.fetchedBatch = res,
            error: (error: any) => this.notification.showError(error)
        });

        this.params.getAllDivisions().subscribe({
            next: (res: any) => this.fetchedDivision = res,
            error: (error: any) => this.notification.showError(error)
        });

        this.specs.getRAMCapacities().subscribe({
            next: (res: any) => this.fetchedRAM = res,
            error: (error: any) => this.notification.showError(error)
        });

        this.specs.getStorageCapacities().subscribe({
            next: (res: any) => this.fetchedStorage = res,
            error: (error: any) => this.notification.showError(error)
        });

        this.specs.getVideoCardCapacities().subscribe({
            next: (res: any) => this.fetchedGPU = res,
            error: (error: any) => this.notification.showError(error)
        });

        this.aioAuth.getAIOBrands().subscribe({
            next: (res: any) => this.fetchedAIOBrand = res,
            error: (error: any) => this.notification.showError(error)
        });

        this.laptopAuth.getLaptopBrands().subscribe({
            next: (res: any) => this.fetchedLaptopBrand = res,
            error: (error : any) => this.notification.showError(error)
        });

        this.printerAuth.getPrinterBrands().subscribe({
            next: (res: any) => this.fetchedPrinterBrand = res,
            error: (error: any) => this.notification.showError(error)
        });

        this.routerAuth.getRouterBrands().subscribe({
            next: (res: any) => this.fetchedRouterBrand = res,
            error: (error: any) => this.notification.showError(error)
        })

        this.scannerAuth.getScannerBrands().subscribe({
            next: (res: any) => this.fetchedScannerBrand = res,
            error: (error: any) => this.notification.showError(error)
        });

        this.tabletAuth.getTabletBrands().subscribe({
            next: (res: any) => this.fetchedTabletBrand = res,
            error: (error: any) => this.notification.showError(error)
        });


        this.scannerAuth.getScannerType().subscribe({
            next: (res: any) => this.fetchedScannerType = res,
            error: (error: any) => this.notification.showError(error)
        });

        this.routerAuth.getNetworkSpeed().subscribe({
            next: (res: any) => this.fetchedSpeed = res,
            error: (error: any) => this.notification.showError(error)
        });

        this.routerAuth.getNumberOfAntennas().subscribe({
            next: (res: any) => this.fetchedAntennas = res,
            error: (error: any) => this.notification.showError(error)
        });

        this.params.getSuppliers().subscribe({
            next: (res: any) => this.fetchedSuppliers = res,
            error: (error: any) => this.notification.showError(error)
        });
    }

    createFilterForm(): FormGroup {
        return new FormGroup({
            device: new FormControl(null),
            batchId: new FormControl(null),
            divisionId: new FormControl(null),
            sectionId: new FormControl(null),
            status: new FormControl(null),
            brandId: new FormControl(null),
            model: new FormControl(null),
            brandSeries: new FormControl(null),
            storageCapacityId: new FormControl(null),
            storageType: new FormControl(null),
            supplierId: new FormControl(null),
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

    filterDevice(formGroup: FormGroup, devices: any[]): any[] {
        return devices.filter(device => {
            const filters = formGroup.value;

            if (filters.device) {
                const deviceKey = this.deviceObject.find(obj => obj.key === filters.device)?.key;

                if (!deviceKey || !device.tag?.includes(deviceKey)) return false;
            };

            if (filters.batchId && device.batchId !== parseInt(filters.batchId, 10)) return false;

            if (filters.divisionId && device.sectionDTO?.divisionId !== parseInt(filters.divisionId, 10)) return false;

            if (filters.sectionId && device.sectionDTO?.id !== parseInt(filters.sectionId, 10)) return false;

            if (filters.status !== null) {
                const isActive = !device.condemnedDTO;

                if ((filters.status && !isActive) || (!filters.status && isActive)) {
                    return false;
                }
            }

            if (filters.storageType && device.storageDTOs?.type !== parseInt(filters.storageType, 10)) return false;

            if (filters.supplierId !== null) {
                const mappedBatch = this.fetchedBatch.find((batch: any) => batch.id === device.batchId);

                if (mappedBatch.supplierId === parseInt(filters.supplierId, 10)) return false;
            }

            if (filters.brandId && device.brandDTO?.id !== parseInt(filters.brandId, 10)) return false;

            if (filters.model && device.model !== filters.model) return false;

            if (filters.brandSeries && device.brandSeries !== filters.brandSeries) return false;

            if (filters.storageCapacityId && !device.storageDTOs?.some((storage: any) => storage.capacityDTO?.id === parseInt(filters.storageCapacityId, 10))) return false;

            if (filters.ramCapacityId && !device.ramDTOs?.some((ram: any) => ram.capacityDTO?.id === parseInt(filters.ramCapacityId, 10))) return false;

            if (filters.videoCardCapacityId && !device.videoCardDTO?.capacityDTO?.id !== filters.videoCardCapacityId) return false;

            if (filters.screenSize && device.screenSize !== parseInt(filters.screenSize, 10)) return false;

            if (filters.printerTypeId && device.printerTypeDTO?.id !== parseInt(filters.printerTypeId)) return false;

            if (filters.isWithScanner && device.withScanner !== filters.isWithScanner) return false;

            if (filters.networkSpeedId && device.networkSpeedDTO?.id !== parseInt(filters.networkSpeedId)) return false;

            if (filters.numberOfAntennasId && device.antennaDTO?.id !== filters.numberOfAntennasId) return false;

            if (filters.scannerTypeId && device.scannerTypeDTO?.id !== filters.scannerTypeId) return false;

            return true;
        })
    }

    getSection(event: Event): void {
        let selectElement = event.target as HTMLSelectElement;

        this.params.getSectionsByDivisionId(selectElement.value).subscribe({
            next: (res: any) => this.fetchedSection = res,
            error: (error: any) => this.notification.showError(error)
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

    getStorageType(event: Event): void {
        const selectElement = event.target as HTMLSelectElement;

        if (selectElement.value) {
            this.filterForm.patchValue({ storageType: selectElement.value });
        }
    }

    submitFilter() {
        this.filter.emit(this.filterDevice(this.filterForm, this.fetchedDevices));
        this.filterForm.reset();
    }
}
