import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Observable, forkJoin, of, tap, switchMap } from 'rxjs';

import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { TabsModule } from 'primeng/tabs';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialog } from 'primeng/confirmdialog';

import { Requestservice } from '../../../utilities/services/requestservice';
import { Signalservice } from '../../../utilities/services/signalservice';
import { Nodeservice } from '../../../utilities/services/nodeservice';

@Component({
  selector: 'app-laptop',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ButtonModule,
    Select,
    InputTextModule,
    KeyFilterModule,
    TabsModule,
    MultiSelectModule,
    ConfirmDialog
  ],
  templateUrl: './laptop.html',
  styleUrl: './laptop.css'
})
export class DeviceLaptop {
  selectedNodes: any;
  divisionOption!: string;
  procBrandOptions: any;

  router = inject(Router);
  requestAuth = inject(Requestservice);
  signalService = inject(Signalservice);
  notification = inject(MessageService);
  nodeService = inject(Nodeservice);
  confirmation = inject(ConfirmationService);

  laptopId = signal<number>(0);
  quantity = signal<number>(0);
  sectionsByDivId = signal([]);
  seriesByBrandId = signal([]);
  brand = signal<any>([]);
  batchDetails = signal<any | null>(null);

  laptopForm!: FormGroup;

  constructor() {
    this.laptopForm = this.createLaptopForm();

    this.requestAuth.getAllLaptopBrand().subscribe((res: any) => this.brand.set(res));

    const navigation = this.router.getCurrentNavigation();

    if (navigation?.extras.state) {
      this.quantity.set(navigation.extras.state['count']);
    }

    effect(() => {
      if (this.signalService.batchDetails()) {
        this.batchDetails.set(this.signalService.batchDetails());
      }

      if (this.signalService.deviceDetails()) {
        this.laptopId.set(this.signalService.deviceDetails().id);
        const processorDTO = this.laptopForm.get('processorDTO') as FormGroup;

        this.laptopForm.addControl('div_id', new FormControl(null, Validators.required));
        this.requestAuth.getSectionById(this.signalService.deviceDetails().section_id).pipe(
          switchMap((section: any) =>
            this.requestAuth.getDivisionById(section.div_id).pipe(
              tap((division: any) => {
                this.laptopForm.get('div_id')?.setValue(division.id);
                this.laptopForm.get('section_id')?.setValue(this.signalService.deviceDetails().section_id);
              }),
              switchMap((division: any) =>
                this.requestAuth.getSectionsByDivisionId(division.id)
              )
            )
          )
        ).subscribe({
          next: (res: any) => this.sectionsByDivId.set(res),
          error: (error: any) => this.notification.add({ severity: 'error', summary: 'Error', detail: String(error) })
        });

        processorDTO.addControl('brand_id', new FormControl(null, Validators.required));
        this.requestAuth.getProcessorSeriesById(this.signalService.deviceDetails().processorDTO.series_id).pipe(
          switchMap((series: any) =>
            this.requestAuth.getProcessorBrandById(series.brand_id).pipe(
              tap((brand: any) => {
                this.laptopForm.get('processorDTO.brand_id')?.setValue(brand.id);
                this.laptopForm.get('processorDTO.series_id')?.setValue(this.signalService.deviceDetails().processorDTO.series_id);
              }),
              switchMap((brand: any) =>
                this.requestAuth.getAllProcessorSeriesByBrandId(brand.id)
              )
            )
          )
        ).subscribe({
          next: (res: any) => this.seriesByBrandId.set(res),
          error: (error: any) => this.notification.add({ severity: 'error', summary: 'Error', detail: String(error) })
        });

        this.laptopForm.get('gpu_id')?.patchValue(this.signalService.deviceDetails().gpu_id);
        this.laptopForm.patchValue(this.signalService.deviceDetails());
        this.laptopForm.get('serial_number')?.setValue('Temporarily disabled');
      }
    });
  }

  get dynamicDivisionControl(): FormControl {
    return (this.laptopForm.get('div_id') as FormControl) ?? new FormControl(null);
  }

  get dynamicBrandControl(): FormControl {
    const processorDTO = this.laptopForm.get('processorDTO') as FormGroup;

    return (processorDTO.get('brand_id') as FormControl) ?? new FormControl(null);
  }

  createLaptopForm(): FormGroup {
    return new FormGroup({
      batch_id: new FormControl<number | null>(null),
      section_id: new FormControl<number | null>(null, [Validators.required]),
      serial_number: new FormControl<string | null>({ value: 'Temporarily disabled', disabled: true }),
      ups_id: new FormControl<number | any>(null),
      storageDTO: new FormArray([this.createStorageGroup()]),
      ramDTO: new FormArray([this.createRamGroup()]),
      gpu_id: new FormControl<number | null>(null, [Validators.required]),
      processorDTO: new FormGroup({
        series_id: new FormControl<number | null>(null, [Validators.required]),
        model: new FormControl<string | null>(null, [Validators.required])
      }),
      brand_id: new FormControl<number | null>(null, [Validators.required]),
      model: new FormControl<string | null>(null, [Validators.required]),
      connectionDTO: new FormControl<number[] | null>([]),
      peripheralDTO: new FormControl<number[] | null>([]),
      os_id: new FormControl<number | null>(null, [Validators.required]),
      prod_id: new FormControl<number | null>(null),
      security_id: new FormControl<number | null>(null),
      accountable_user: new FormControl<string | null>(null),
      co_accountable_user: new FormControl<string | null>(null)
    });
  }

  getSectionSelectValue(event: any): void {
    this.requestAuth.getSectionsByDivisionId(event.value).subscribe(
      (res: any) => this.sectionsByDivId.set(res)
    );
  }

  getProcSeriesSelectValue(event: any): void {
    this.requestAuth.getAllProcessorSeriesByBrandId(event.value).subscribe(
      (res: any) => this.seriesByBrandId.set(res)
    );
  }

  // ---- RAM ----
  createRamGroup(): FormGroup {
    return new FormGroup({
      capacity_id: new FormControl<number | null>(null, [Validators.required])
    });
  }

  get ramArray(): FormArray {
    return this.laptopForm.get('ramDTO') as FormArray;
  }

  addRAM = () => {
    this.ramArray.push(this.createRamGroup());
  }

  removeRAM = (index: number) => {
    if (this.ramArray.length > 1) {
      this.ramArray.removeAt(index);
    }
  }

  // ---- Storage ----
  createStorageGroup(): FormGroup {
    return new FormGroup({
      capacity_id: new FormControl<any | null>(null, [Validators.required]),
      type_id: new FormControl<number | null>(null, [Validators.required])
    });
  }

  get storageArray(): FormArray {
    return this.laptopForm.get('storageDTO') as FormArray;
  }

  addStorage(): void {
    this.storageArray.push(this.createStorageGroup());
  }

  removeStorage(index: number): void {
    if (this.storageArray.length > 1) {
      this.storageArray.removeAt(index);
    }
  }

  postLaptop(): void {
    if (this.signalService.deviceDetails()) {
      const rawValue: any = this.laptopForm.value;
      rawValue.batch_id = this.batchDetails().id;
      rawValue.serial_number = rawValue.serial_number || null;

      const tasks: Observable<any>[] = [];

      const ensureEntityId = (
        currentValue: string | number,
        existingList: any[],
        key: string,
        nameKey: string,
        postFn: (name: string) => Observable<any>,
        reinitFn: () => void,
        rawValue: any,
        tasks: Observable<any>[]
      ): void => {
        if (typeof currentValue === 'number') {
          rawValue[key] = currentValue;
          return;
        }

        if (typeof currentValue === 'string') {
          const match = existingList.find(
            (e) => String(e[nameKey]).toLowerCase() === currentValue.toLowerCase()
          );
          if (match) {
            rawValue[key] = match.id;
          } else {
            tasks.push(
              postFn(currentValue).pipe(
                tap((res) => {
                  rawValue[key] = res.id;
                  reinitFn();
                })
              )
            );
          }
        }
      };

      // Brand
      ensureEntityId(
        rawValue.brand_id,
        this.brand(),
        'brand_id',
        'name',
        (name) => this.requestAuth.postAIOBrand(name),
        () => this.requestAuth.getAllAIOBrand().subscribe((res: any) => this.brand.set(res)),
        rawValue,
        tasks
      );

      // OS
      ensureEntityId(
        rawValue.os_id,
        this.signalService.os(),
        'os_id',
        'name',
        (name) => this.requestAuth.postSoftwareOS(name),
        () => this.signalService.reinitializeOS(),
        rawValue,
        tasks
      );

      // Productivity Tool
      ensureEntityId(
        rawValue.prod_id,
        this.signalService.productivityTools(),
        'prod_id',
        'name',
        (name) => this.requestAuth.postSoftwareProdTool(name),
        () => this.signalService.reinitializeProdTool(),
        rawValue,
        tasks
      );

      // Security
      ensureEntityId(
        rawValue.security_id,
        this.signalService.security(),
        'security_id',
        'name',
        (name) => this.requestAuth.postSoftwareSecurity(name),
        () => this.signalService.reinitializeSecurity(),
        rawValue,
        tasks
      );

      // Process Capacities
      const processCapacities = (
        dtoArray: any[],
        existingList: { id: number; capacity: string }[],
        postFn: (capacity: number) => Observable<any>,
        reinitFn: () => void,
        tasks: Observable<any>[]
      ) => {
        dtoArray.forEach((item) => {
          if (typeof item.capacity_id === 'string') {
            const match = existingList.find(
              (e) => String(e.capacity) === item.capacity_id
            );
            if (match) {
              item.capacity_id = match.id;
            } else {
              tasks.push(
                postFn(Number(item.capacity_id)).pipe(
                tap((res) => {
                  item.capacity_id = res.id;
                  reinitFn();
                })
                )
              );
            }
          }
        });
      };

      processCapacities(
        rawValue.ramDTO,
        this.signalService.ram(),
        (cap) => this.requestAuth.postRAMCapacity(cap),
        () => this.signalService.reinitializeRAM(),
        tasks
      );
      processCapacities(
        rawValue.storageDTO,
        this.signalService.storage(),
        (cap) => this.requestAuth.postStorageCapacity(cap),
        () => this.signalService.reinitializeStorage(),
        tasks
      );

      // GPU
      if (typeof rawValue.gpu_id === 'string') {
        const match = this.signalService.gpu().find(
          (g) => String(g.capacity) === rawValue.gpu_id
        );
        if (match) {
          rawValue.gpu_id = match.id;
        } else {
          tasks.push(
            this.requestAuth.postGPUCapacity(parseInt(rawValue.gpu_id, 10)).pipe(
              tap((res) => {
                rawValue.gpu_id = res.id;
                this.signalService.reinitializeGPU();
              })
            )
          );
        }
      }
      // Wait for all entity creation before posting AIO
      forkJoin(tasks.length ? tasks : [of(null)]).subscribe({
        next: () => {
          this.requestAuth.putDeviceLaptop(this.laptopId(), rawValue).subscribe({
            next: () => {
              this.notification.add({ severity: 'success', summary: 'Success', detail: `${this.signalService.deviceDetails().device_number} updated successfully.` });
              this.router.navigate(['/batch-list/batch-details']);
              this.signalService.deviceDetails.set([]);
            },
            error: (error: any) => {
              this.notification.add({ severity: 'error', summary: 'Error', detail: String(error) });
            }
          });
        },
        error: (error) => {
          this.notification.add({ severity: 'error', summary: 'Error', detail: String(error) });
        }
      });
    } else {
      const rawValue: any = this.laptopForm.value;
      rawValue.batch_id = this.batchDetails().id;
      rawValue.serial_number = rawValue.serial_number || null;

      const tasks: Observable<any>[] = [];

      const ensureEntityId = (
        currentValue: string | number,
        existingList: any[],
        key: keyof typeof existingList[0],
        nameKey: keyof typeof existingList[0],
        postFn: (name: string) => Observable<any>
      ): void => {
        if (typeof currentValue === 'string') {
          const match = existingList.find(
            (e) => String(e[nameKey]).toLowerCase() === currentValue.toLowerCase()
          );
          if (match) {
            rawValue[key] = match.id;
          } else {
            tasks.push(
              postFn(currentValue).pipe(
                tap((res) => (rawValue[key] = res.id))
              )
            );
          }
        }
      };

      // Brand
      ensureEntityId(rawValue.brand_id, this.brand(), 'brand_id', 'name',
        (name) => this.requestAuth.postLaptopBrand(name)
      );

      // OS
      ensureEntityId(rawValue.os_id, this.signalService.os(), 'os_id', 'name',
        (name) => this.requestAuth.postSoftwareOS(name)
      );

      // Productivity Tool
      ensureEntityId(rawValue.prod_id, this.signalService.productivityTools(), 'prod_id', 'name',
        (name) => this.requestAuth.postSoftwareProdTool(name)
      );

      // Security
      ensureEntityId(rawValue.security_id, this.signalService.security(), 'security_id', 'name',
        (name) => this.requestAuth.postSoftwareSecurity(name)
      );

      // Process Capacities
      const processCapacities = (
        dtoArray: any[],
        existingList: { id: number; capacity: string }[],
        postFn: (capacity: number) => Observable<any>
      ) => {
        const existingCaps = existingList.map((e) => String(e.capacity));
        dtoArray.forEach((item) => {
          if (typeof item.capacity_id === 'string') {
            const match = existingList.find(
              (e) => String(e.capacity) === item.capacity_id
            );
            if (match) {
              item.capacity_id = match.id;
            }
          }
        });

        const newCaps = Array.from(
          new Set(
            dtoArray
              .filter((item) => typeof item.capacity_id === 'string')
              .map((item) => item.capacity_id)
              .filter((cap) => !existingCaps.includes(String(cap)))
          )
        );

        newCaps.forEach((cap) => {
          tasks.push(
            postFn(Number(cap)).pipe(
              tap((res) => {
                dtoArray.forEach((item) => {
                  if (item.capacity_id === cap) {
                    item.capacity_id = res.id;
                  }
                });
              })
            )
          );
        });
      };

      processCapacities(rawValue.ramDTO, this.signalService.ram(), (cap) => this.requestAuth.postRAMCapacity(cap));
      processCapacities(rawValue.storageDTO, this.signalService.storage(), (cap) => this.requestAuth.postStorageCapacity(cap));

      // GPU
      if (typeof rawValue.gpu_id === 'string') {
        tasks.push(
          this.requestAuth.postGPUCapacity(rawValue.gpu_id).pipe(
            tap((res) => {
              rawValue.gpu_id = res.id;
              this.signalService.reinitializeGPU();
            })
          )
        );
      }

      // Wait for all entity creation before posting AIO
      forkJoin(tasks.length ? tasks : [of(null)]).subscribe({
        next: () => {
          const duplicatedArray = Array.from({ length: this.quantity() }, () => structuredClone(rawValue));
          this.requestAuth.postLaptop(duplicatedArray).subscribe({
            next: (res: any) => {
              this.notification.add({ severity: 'success', summary: 'Success', detail: `${duplicatedArray.length} laptop/s saved successfully.` });
              const updatedList = [...this.signalService.currentBatchDeviceData(), ...res.devices];
              this.signalService.addedDevice.set(res.devices);
              this.signalService.currentBatchDeviceData.set(updatedList);
              this.router.navigate(['/batch-list/batch-details']);
            },
            error: (error: any) => {
              this.notification.add({ severity: 'error', summary: 'Error', detail: String(error) });
            }
          });
        },
        error: (error) => {
          this.notification.add({ severity: 'error', summary: 'Error', detail: String(error) });
        }
      });
    }
  }

  backButton(event: Event): void {
    if (this.laptopForm.dirty) {
      this.confirmation.confirm({
        target: event.target as EventTarget,
        message: "Any unsaved progress will be lost. Are you sure you want to continue?",
        header: 'Confirmation',
        closable: true,
        closeOnEscape: true,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Continue',
        rejectLabel: 'Cancel',
        acceptButtonStyleClass: 'p-button-danger',
        rejectButtonStyleClass: 'p-button-contrast',
        accept: () => {
          this.router.navigate(['/batch-list/batch-details']);
          this.signalService.deviceDetails.set(null);
        }
      });
    } else {
      this.router.navigate(['/batch-list/batch-details']);
      this.signalService.deviceDetails.set(null);
    }
  }
}
