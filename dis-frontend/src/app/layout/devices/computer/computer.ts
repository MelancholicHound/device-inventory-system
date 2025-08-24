import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Observable, forkJoin, of, tap } from 'rxjs';

import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { TabsModule } from 'primeng/tabs';
import { MultiSelectModule } from 'primeng/multiselect';
import { TreeSelect } from 'primeng/treeselect';
import { ConfirmDialog } from 'primeng/confirmdialog';

import { Requestservice } from '../../../utilities/services/requestservice';
import { Signalservice } from '../../../utilities/services/signalservice';
import { Nodeservice } from '../../../utilities/services/nodeservice';

@Component({
  selector: 'app-computer',
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
    TreeSelect,
    ConfirmDialog
  ],
  templateUrl: './computer.html',
  styleUrl: './computer.css'
})
export class DeviceComputer {
  node: any[] = [];
  selectedNodes: any;

  router = inject(Router);
  requestAuth = inject(Requestservice);
  signalService = inject(Signalservice);
  notification = inject(MessageService);
  nodeService = inject(Nodeservice);
  confirmation = inject(ConfirmationService);

  quantity = signal(0);
  sectionsByDivId = signal([]);
  seriesByBrandId = signal([]);
  moboBrand = signal<any>([]);
  batchDetails = signal<any | null>(null);

  computerForm!: FormGroup;

  constructor() {
    this.computerForm = this.createComputerForm();

    this.requestAuth.getAllMotherboardBrand().subscribe((res: any) => this.moboBrand.set(res));

    const navigation = this.router.getCurrentNavigation();

    if (navigation?.extras.state) {
      this.quantity.set(navigation.extras.state['count']);
    }

    this.nodeService.getTreeNodesData().subscribe({
      next: (res: any) => {
        this.node = res;
      },
      error: (error: any) => {
        this.notification.add({
          severity: 'error',
          summary: 'Error',
          detail: `${error}`
        });
      }
    })

    effect(() => {
      if (this.signalService.batchDetails()) {
        this.batchDetails.set(this.signalService.batchDetails());
      }
    });
  }

  createComputerForm(): FormGroup {
    return new FormGroup({
      batch_id: new FormControl<number | null>(null),
      section_id: new FormControl<number | null>(null, [Validators.required]),
      serial_number: new FormControl<string | null>(null),
      ups_id: new FormControl<number | any>(null),
      storageDTO: new FormArray([this.createStorageGroup()]),
      ramDTO: new FormArray([this.createRamGroup()]),
      gpu_id: new FormControl<number | null>(null, [Validators.required]),
      processorDTO: new FormGroup({
        series_id: new FormControl<number | null>(null, [Validators.required]),
        model: new FormControl<string | null>(null, [Validators.required])
      }),
      motherboardDTO: new FormGroup({
        brand_id: new FormControl<number | null>(null, [Validators.required]),
        model: new FormControl<string | null>(null, [Validators.required])
      }),
      connectionDTO: new FormControl<number[] | null>([]),
      peripheralDTO: new FormControl<number[] | null>([]),
      os_id: new FormControl<number | null>(null, [Validators.required]),
      prod_id: new FormControl<number | null>(null),
      security_id: new FormControl<number | null>(null),
      accountable_user: new FormControl<string | null>(null),
      co_accountable_user: new FormControl<string | null>(null)
    });
  }

  getSelectedUPS(event: any): void {
    const node = event.node;
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
    return this.computerForm.get('ramDTO') as FormArray;
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
    return this.computerForm.get('storageDTO') as FormArray;
  }

  addStorage(): void {
    this.storageArray.push(this.createStorageGroup());
  }

  removeStorage(index: number): void {
    if (this.storageArray.length > 1) {
      this.storageArray.removeAt(index);
    }
  }

  postComputer(): void {
    const rawValue: any = this.computerForm.value;
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
        const normalized = currentValue.trim().toLowerCase();

        const match = existingList.find(
          (e) => String(e[nameKey]).toLowerCase() === normalized
        );

        if (match) {
          rawValue[key] = match.id;
          return;
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

    //Motherboard brand
    ensureEntityId(
      rawValue?.motherboardDTO.brand_id,
      this.moboBrand(),
      'brand_id',
      'name',
      (name) => this.requestAuth.postMotherboardBrand(name),
      () => this.requestAuth.getAllMotherboardBrand().subscribe((res: any) => this.moboBrand.set(res)),
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
      key: string,
      postFn: (capacity: number) => Observable<any>,
      reinitFn: () => void,
      tasks: Observable<any>[]
    ) => {
      const items = Array.isArray(dtoArray) ? dtoArray : [dtoArray];

      const uniqueStrings = Array.from(
        new Set(
          items.filter((item) => typeof item[key] === 'string')
          .map((item) => item[key])
        )
      );

      uniqueStrings.forEach((value) => {
        const match = existingList.find((e) => String(e.capacity) === value);
        if (match) {
          items.forEach((item) => {
            if (item[key] === value) {
              item[key] = match.id;
            }
          });
        } else {
          tasks.push(
            postFn(Number(value)).pipe(
              tap((res) => {
                items.forEach((item) => {
                  if (item[key] === value) {
                    item[key] = res.id;
                  }
                });
                reinitFn();
              })
            )
          );
        }
      });
    }

    processCapacities(
      rawValue.ramDTO,
      this.signalService.ram(),
      'capacity_id',
      (cap) => this.requestAuth.postRAMCapacity(cap),
      () => this.signalService.reinitializeRAM(),
      tasks
    );

    processCapacities(
      rawValue.storageDTO,
      this.signalService.storage(),
      'capacity_id',
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

    // Wait for all entity creation before posting Computer
    forkJoin(tasks.length ? tasks : [of(null)]).subscribe({
      next: () => {
        const duplicatedArray = Array.from({ length: this.quantity() }, () => structuredClone(rawValue));
        this.requestAuth.postComputer(duplicatedArray).subscribe({
          next: (res: any) => {
            this.notification.add({ severity: 'success', summary: 'Success', detail: `${duplicatedArray.length} computer/s saved successfully.` });
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

  backButton(event: Event): void {
    if (this.computerForm.dirty) {
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
        accept: () => this.router.navigate(['/batch-list/batch-details'])
      });
    } else {
      this.router.navigate(['/batch-list/batch-details']);
    }
  }
}
