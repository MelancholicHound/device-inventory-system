import { Component, EventEmitter, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

import { Store } from '@ngrx/store';

import { AuthService } from '../../util/services/auth.service';
import { ParamsService } from '../../util/services/params.service';
import { SpecsService } from '../../util/services/specs.service';
import { DeviceLaptopService } from '../../util/services/device-laptop.service';

import { updateChildData } from '../../util/store/app.actions';

@Component({
    selector: 'app-laptop',
    standalone: true,
    imports: [
        NgFor, NgIf,
        ReactiveFormsModule,
        FormsModule
    ],
    providers: [
        ParamsService,
        SpecsService,
        DeviceLaptopService
    ],
    templateUrl: './laptop.component.html',
    styleUrl: './laptop.component.scss'
})
export class LaptopComponent implements OnInit {
    device =  { name: 'Laptop', indicator: 'laptop' };
    deviceCount!: any; batchId: any; batchNumber: any;
    procBrandId: any; childCount: any;

    isProcBrandToggled: boolean = false; isProcSeriesToggled: boolean = false;
    isLaptopBrandToggled: boolean = false; isAddingStorage: boolean = false;

    isProcBrandAnimated: boolean = false; isProcSeriesAnimated: boolean = false;
    isLaptopBrandAnimated: boolean = false;

    fetchedLaptopBrand!: any;
    fetchedDivision!: any; fetchedSection!: any;

    fetchedProcBrand!: any; fetchedProcSeries!: any;
    fetchedRAM!: any; fetchedStorage!: any; fetchedGPU!: any;

    laptopForm!: FormGroup;

    constructor(private params: ParamsService,
                private specs: SpecsService,
                private laptopAuth: DeviceLaptopService,
                private store: Store) { }

    ngOnInit(): void {
        this.batchId = history.state.batchid;
        this.deviceCount = history.state.count;
        this.batchNumber = history.state.batchnumber;

        this.laptopForm = this.createLaptopFormGroup();

        this.laptopAuth.getLaptopBrands().subscribe({
            next: (data: any[]) => this.fetchedLaptopBrand = data,
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

          this.laptopForm.patchValue({ brandId: payload.brandDTO.id });
          this.laptopForm.patchValue({ model: payload.model });

          this.laptopForm.patchValue({ divisionId: payload.sectionDTO.divisionId });
          this.params.getSectionsByDivisionId(payload.sectionDTO.divisionId).subscribe((res: any[]) => this.fetchedSection = res);
          this.laptopForm.patchValue({ sectionId: payload.sectionDTO.id });

          this.laptopForm.patchValue({ cpuRequest: { cpuBrandId: payload.cpuDTO.brandDTO.id } });
          this.specs.getProcSeriesById(payload.cpuDTO.brandDTO.id).subscribe((res: any[]) => this.fetchedProcSeries = res);
          this.laptopForm.patchValue({ cpuRequest: { cpuBrandSeriesId: payload.cpuDTO.brandSeriesDTO.id } });
          this.laptopForm.patchValue({ cpuRequest: { cpuModifier: payload.cpuDTO.cpuModifier } });

          this.laptopForm.patchValue({ screenSize: payload.screenSize });
          this.laptopForm.patchValue({ videoCardRequest: { capacityId: payload.videoCardDTO.capacityDTO.id } });

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

    createLaptopFormGroup(): FormGroup {
        return new FormGroup({
            batchId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
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
            screenSizeByInches: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')])
        });
    }

    //GET
    getLaptopBrandValue() {
        let value = document.getElementById('laptop-brand') as HTMLOptionElement;
        this.laptopForm.patchValue({ brandId: parseInt(value.value, 10) });
    }

    getDivisionValue() {
        let value = document.getElementById('division') as HTMLOptionElement;
        this.params.getSectionsByDivisionId(value.value).subscribe((res: any[]) => this.fetchedSection = res);
    }

    getSectionValue() {
        let value = document.getElementById('section') as HTMLOptionElement;
        this.laptopForm.patchValue({ sectionId: parseInt(value.value, 10) });
    }

    getProcBrand() {
        let value = document.getElementById('proc-brand') as HTMLOptionElement;
        this.specs.getProcSeriesById(value.value).subscribe(res => this.fetchedProcSeries = res);
        this.procBrandId = value.value;
        this.laptopForm.patchValue({ cpuRequest: { cpuBrandId: parseInt(value.value, 10) } });
    }

    getProcSeries() {
        let value = document.getElementById('proc-series') as HTMLOptionElement;
        this.laptopForm.patchValue({ cpuRequest: { cpuBrandSeriesId: parseInt(value.value, 10) } });
    }

    //POST
    onLaptopBrandInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.laptopAuth.postLaptopBrand(inputElement.value).subscribe({
                next: (res: any) => this.laptopForm.patchValue({ brandId: res.id }),
                error: (error: any) => console.error(error)
            });
        }
    }

    onProcBrandInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.specs.postProcBrand(inputElement.value).subscribe({
                next: (res: any) => this.laptopForm.patchValue({ cpuRequest: { cpuBrandId: res.id } }),
                error: (error: any) => console.error(error)
            });
        }
    }

    onProcSeriesInput(id: any, event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.specs.postProcSeries(id, inputElement.value).subscribe({
                next: (res: any) => this.laptopForm.patchValue({ cpuRequest: { cpuBrandSeriesId: res.id } }),
                error: (error: any) => console.error(error)
            });
        }
    }

    onProcModifierInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.value !== '') {
            this.laptopForm.patchValue({ cpuRequest: { cpuModifier: inputElement.value } });
        }
    }

    onRAMInput(event: Event): void {
        let inputElement = event.target as HTMLInputElement;
        let ramArray = this.laptopForm.get('ramRequests') as FormArray;

        let matchingRAM = this.fetchedRAM.find((ram: any) => ram.capacity === parseInt(inputElement.value, 10));

        if (matchingRAM) {
            ramArray.push(new FormGroup({
                capacityId: new FormControl(matchingRAM.id, [Validators.required])
            }));
        } else {
            this.specs.postRAMCapacity(inputElement.value).subscribe({
                next: (res: any) => {
                    ramArray.push(new FormGroup({
                        capacityId: new FormControl(res.id, [Validators.required])
                    }));
                },
                error: (error: any) => console.error(error)
            });
        }
    }

    onGPUInput(event: Event): void {
        let inputElement = event.target as HTMLInputElement;

        let matchingGPU = this.fetchedGPU.find((gpu: any) => gpu.capacity === parseInt(inputElement.value, 10));

        if (matchingGPU) {
            this.laptopForm.get('videoCardRequest')?.setValue({ capacityId: matchingGPU.id });
        } else {
            this.specs.postGPUCapacity(inputElement.value).subscribe({
                next: (res: any) => this.laptopForm.get('videoCardRequest')?.setValue({ capacityId: res.id }),
                error: (error: any) => console.error(error)
            });
        }
    }

    onStorageInput(event: Event): void {
        let inputElement = event.target as HTMLInputElement;
        let typeSelect = document.getElementById('type') as HTMLSelectElement;
        let storageArray = this.laptopForm.get('storageRequests') as FormArray;

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

    postLaptopSpecs(): void {
        this.laptopForm.patchValue({ batchId: this.batchId });
        this.laptopForm.removeControl('divisionId');
        this.store.dispatch(updateChildData({ data: this.laptopForm.value }));
    }

    //Other function
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

    addRAM() {
        const ram = document.getElementById('ram');
        const ramSizeField = document.getElementById('ram-field');
        const clonedElement = ramSizeField?.cloneNode(true) as HTMLElement;
        const childCount = ram?.childElementCount;

        const newId = `ram-size-${childCount}`;

        const clonedInput = clonedElement.querySelector('input');
        if (clonedInput) {
            clonedInput.id = newId;
            clonedInput.value = '';

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

        const newIdSize = `storage-size-${this.childCount}`;
        const newIdType = `type-${this.childCount}`;

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
}
