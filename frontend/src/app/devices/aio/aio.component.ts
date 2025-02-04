import { Component, OnInit, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Store } from '@ngrx/store';

import { AuthService } from '../../util/services/auth.service';
import { ParamsService } from '../../util/services/params.service';
import { SpecsService } from '../../util/services/specs.service';
import { DeviceAioService } from '../../util/services/device-aio.service';
import { NotificationService } from '../../util/services/notification.service';
import { TransactionService } from '../../util/services/transaction.service';

import { updateChildData } from '../../util/store/app.actions';

@Component({
    selector: 'app-aio',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule
    ],
    providers: [
        AuthService,
        ParamsService,
        SpecsService,
        DeviceAioService,
        NotificationService
    ],
    templateUrl: './aio.component.html',
    styleUrl: './aio.component.scss'
})
export class AioComponent implements OnInit {
    device = { name: 'AIO', indicator: 'aio' };
    deviceCount: any; batchNumber: any;
    procBrandId: any; childCount!: any;
    fromComputerInventory: any;

    isProcBrandToggled: boolean = false; isProcSeriesToggled: boolean = false;
    isAIOBrandToggled: boolean = false; isAddingStorage: boolean = false;

    isProcBrandAnimated: boolean = false; isProcSeriesAnimated: boolean = false;
    isAIOBrandAnimated: boolean = false;

    fetchedAIOBrand!: any;
    fetchedDivision!: any; fetchedSection!: any;

    fetchedProcBrand!: any; fetchedProcSeries!: any;
    fetchedRAM!: any; fetchedStorage!: any; fetchedGPU!: any;

    sNumber!: number;

    aioForm!: FormGroup;

    constructor(private params: ParamsService,
                private specs: SpecsService,
                private aioAuth: DeviceAioService,
                private store: Store,
                private notification: NotificationService,
                private transaction: TransactionService) { }

    ngOnInit(): void {
        this.fromComputerInventory = history.state.inventorydetails;
        this.batchNumber = history.state.batchnumber;
        this.deviceCount = history.state.count;

        this.aioForm = this.createAIOFormGroup();

        this.aioAuth.getAIOBrands().subscribe({
            next: (data: any[]) => this.fetchedAIOBrand = data,
            error: (error: any) => console.error(error)
        });

        this.params.getAllDivisions().subscribe({
            next: (data: any[]) => this.fetchedDivision = data,
            error: (error: any) => console.error(error)
        });

        this.specs.getAllProcBrands().subscribe({
            next: (data: any[]) => this.fetchedProcBrand = data,
            error: (error: any) => console.error(error)
        });

        this.specs.getRAMCapacities().subscribe({
            next: (data: any[]) => this.fetchedRAM = data,
            error: (error: any) => console.error(error)
        });

        this.specs.getStorageCapacities().subscribe({
            next: (data: any[]) => this.fetchedStorage = data,
            error: (error: any) => console.error(error)
        });

        this.specs.getVideoCardCapacities().subscribe({
            next: (data: any[]) => this.fetchedGPU = data,
            error: (error: any) => console.error(error)
        });

        if (history.state.devicedetails || history.state.inventorydetails) {
            let payload: any = history.state.devicedetails || history.state.inventorydetails;

            this.aioForm.patchValue({ brandId: payload.brandDTO.id });
            this.aioForm.patchValue({ model: payload.model });

            this.aioForm.patchValue({ divisionId: payload.sectionDTO.divisionId });
            this.params.getSectionsByDivisionId(payload.sectionDTO.divisionId).subscribe((res: any[]) => this.fetchedSection = res);
            this.aioForm.patchValue({ sectionId: payload.sectionDTO.id });

            this.aioForm.patchValue({ cpuRequest: { cpuBrandId: payload.cpuDTO.brandDTO.id } });
            this.specs.getProcSeriesById(payload.cpuDTO.brandDTO.id).subscribe((res: any[]) => this.fetchedProcSeries = res);
            this.aioForm.patchValue({ cpuRequest: { cpuBrandSeriesId: payload.cpuDTO.brandSeriesDTO.id } });
            this.aioForm.patchValue({ cpuRequest: { cpuModifier: payload.cpuDTO.cpuModifier } });

            this.aioForm.patchValue({ screenSize: payload.screenSize });
            this.aioForm.patchValue({ videoCardRequest: { capacityId: payload.videoCardDTO.capacityDTO.id } });

            let ramArray: any = payload.ramDTOs;
            let ramInput = document.getElementById('ram-size') as HTMLInputElement;
            ramInput.value = payload.ramDTOs[0].capacityDTO.capacity;

            if (ramArray.length > 1) {
                for (let i = 1; i < ramArray.length; i++) {
                    this.addRAM();

                    let ram = document.getElementById('ram');
                    let childCount = ram?.childElementCount! - 1;

                    let newRam = document.getElementById(`ram-size-${childCount}`) as HTMLInputElement;
                    newRam.value = payload.ramDTOs[i].capacityDTO.capacity;
                }
            }

            let storageArray: any = payload.storageDTOs;
            let firstStorageType = document.getElementById('type') as HTMLSelectElement;
            let firstStorageSize = document.getElementById('storage-size') as HTMLInputElement;
            firstStorageType.value = payload.storageDTOs[0].type;
            firstStorageSize.value = payload.storageDTOs[0].capacityDTO.capacity;

            if (storageArray.length > 1) {
                for (let i = 1; i < storageArray.length; i++) {
                    this.addStorage();

                    let storage = document.getElementById('storage');
                    let childCount = storage?.childElementCount! - 2;

                    let storageSize = document.getElementById(`storage-size-${childCount}`) as HTMLInputElement;
                    let storageType = document.getElementById(`type-${childCount}`) as HTMLSelectElement;

                    storageSize.value = payload.storageDTOs[i].capacityDTO.capacity;
                    storageType.value = payload.storageDTOs[i].type;
                }
            }
        }
    }

    createAIOFormGroup(): FormGroup {
        return new FormGroup({
            batchId: new FormControl(history.state.batchid, [Validators.required, Validators.pattern('^[0-9]*$')]),
            divisionId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            sectionId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            storageRequests: new FormArray([], [Validators.required]),
            ramRequests: new FormArray([], [Validators.required]),
            videoCardRequest: new FormGroup({ capacityId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]) }),
            cpuRequest: new FormGroup({
                cpuBrandId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
                cpuBrandSeriesId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
                cpuModifier: new FormControl(null, [Validators.required])
            }),
            brandId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            model: new FormControl(null, [Validators.required]),
            screenSize: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')])
        });
    }

    //GET
    getAIOBrandValue() {
        let value = document.getElementById('aio-brand') as HTMLOptionElement;
        this.aioForm.patchValue({ brandId: parseInt(value.value, 10) });
    }

    getDivisionValue() {
        let value = document.getElementById('division') as HTMLOptionElement;
        this.params.getSectionsByDivisionId(value.value).subscribe((res: any[]) => this.fetchedSection = res);
    }

    getSectionValue() {
        let value = document.getElementById('section') as HTMLOptionElement;
        this.aioForm.patchValue({ sectionId: parseInt(value.value, 10) });
        this.transaction.sectionId.set(parseInt(value.value, 10));
    }

    getProcBrand() {
        let value = document.getElementById('proc-brand') as HTMLOptionElement;
        this.specs.getProcSeriesById(value.value).subscribe((res: any[]) => this.fetchedProcSeries = res);
        this.procBrandId = value.value;
        this.aioForm.patchValue({ cpuRequest: { cpuBrandId: parseInt(value.value, 10) } });
    }

    getProcSeries() {
        let value = document.getElementById('proc-series') as HTMLOptionElement;
        this.aioForm.patchValue({ cpuRequest: { cpuBrandSeriesId: parseInt(value.value, 10) } });
    }

    //POST
    onAIOBrandInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.aioAuth.postAIOBrand(inputElement.value).subscribe({
                next: (res: any) => this.aioForm.patchValue({ brandId: res.id }),
                error: (error: any) => console.error(error)
            });
        }
    }

    onProcBrandInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.specs.postProcBrand(inputElement.value).subscribe({
                next: (res: any) => this.aioForm.patchValue({ cpuRequest: { cpuBrandId: res.id } }),
                error: (error: any) => console.error(error)
            });
        }
    }

    onProcSeriesInput(id: any, event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.specs.postProcSeries(id, inputElement.value).subscribe({
                next: (res: any) => this.aioForm.patchValue({ cpuRequest: { cpuBrandSeriesId: res.id } }),
                error: (error: any) => console.error(error)
            });
        }
    }

    onProcModifierInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.aioForm.patchValue({ cpuRequest: { cpuModifier: inputElement.value } });
        }
    }

    onRAMInput(event: Event): void {
        let inputElement = event.target as HTMLInputElement;
        let ramArray = this.aioForm.get('ramRequests') as FormArray;
        let inputCapacity = parseInt(inputElement.value, 10);

        if (!inputElement.value || isNaN(inputCapacity)) return;

        let existingCapacities = ramArray.controls
        .map(control => this.fetchedRAM.find((ram: any) => ram.id === control.value.capacityId)?.capacity)
        .filter(capacity => capacity !== undefined);

        if (existingCapacities.includes(inputCapacity)) return;

        let matchingRAM = this.fetchedRAM.find((ram: any) => ram.capacity === inputCapacity);

        if (typeof matchingRAM === 'undefined') {
            this.specs.postRAMCapacity(inputCapacity).subscribe({
                next: (res: any) => {
                    if (!existingCapacities.includes(inputCapacity)) {
                        ramArray.push(new FormGroup({
                            capacityId: new FormControl(res.id)
                        }));
                    }
                },
                error: (error: any) => this.notification.showError(error)
            });
        } else {
            ramArray.push(new FormGroup({
                capacityId: new FormControl(matchingRAM.id)
            }));
        }
    }

    onGPUInput(event: Event): void {
        let inputElement = event.target as HTMLInputElement;
        let inputCapacity = parseInt(inputElement.value, 10);

        if (!inputElement.value || isNaN(inputCapacity)) return;

        let existingCapacity = this.aioForm.get('videoCardRequest')?.value.capacityId;
        let matchingGPU = this.fetchedGPU.find((gpu: any) => gpu.capacity === inputCapacity);

        if (matchingGPU && existingCapacity === matchingGPU.id) return;

        if (typeof matchingGPU === 'undefined') {
            this.specs.postGPUCapacity(inputCapacity).subscribe({
                next: (res: any) => {
                    if (existingCapacity !== res.id) {
                        this.aioForm.get('videoCardRequest')?.setValue({ capacityId: res.id });
                    }
                },
                error: (error: any) => this.notification.showError(error)
            });
        } else {
            this.aioForm.get('videoCardRequest')?.setValue({ capacityId: matchingGPU.id });
        }
    }

    onStorageInput(event: Event): void {
        let inputElement = event.target as HTMLInputElement;
        let typeSelect = document.getElementById('type') as HTMLSelectElement;
        let storageArray = this.aioForm.get('storageRequests') as FormArray;

        let matchingStorage = this.fetchedStorage.find((storage: any) => storage.capacity === parseInt(inputElement.value, 10));

        if (matchingStorage) {
            let type = this.childCount
            ? (document.getElementById(`type-${this.childCount}`) as HTMLSelectElement)?.value
            : typeSelect.value;

            storageArray.push(new FormGroup({
                capacityId: new FormControl(matchingStorage.id, [Validators.required]),
                type: new FormControl(type, [Validators.required])
            }));

            this.childCount = null;
        } else {
            this.specs.postStorageCapacity(inputElement.value).subscribe({
                next: (res: any) => {
                    storageArray.push(new FormGroup({
                        capacityId: new FormControl(res.id, [Validators.required]),
                        type: new FormControl(typeSelect.value, [Validators.required])
                    }));
                },
                error: (error: any) => console.error(error)
            });
        }
    }

    postAIOSpecs(): void {
        this.aioForm.removeControl('divisionId');
        this.store.dispatch(updateChildData({ data: this.aioForm.value }));
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
        const newIdType = `type-${this.childCount}`

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

    getSerial(event: Event): void {
        let selectElement = event.target as HTMLSelectElement;

        if (selectElement) {
            this.sNumber = parseInt(selectElement.value, 10);
        }
    }

    protected readonly parseInt = parseInt;
}
