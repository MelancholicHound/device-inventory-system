import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Observable, forkJoin, of, tap } from 'rxjs';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { TabsModule } from 'primeng/tabs';
import { MultiSelectModule } from 'primeng/multiselect';

import { Requestservice } from '../../../utilities/services/requestservice';
import { Signalservice } from '../../../utilities/services/signalservice';
import { Nodeservice } from '../../../utilities/services/nodeservice';

@Component({
  selector: 'app-tablet',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ButtonModule,
    Select,
    InputTextModule,
    KeyFilterModule,
    TabsModule,
    MultiSelectModule
  ],
  templateUrl: './tablet.html',
  styleUrl: './tablet.css'
})
export class Tablet {
  node: any[] = [];
  selectedNodes: any;

  router = inject(Router);
  requestAuth = inject(Requestservice);
  signalService = inject(Signalservice);
  notification = inject(MessageService);
  nodeService = inject(Nodeservice);

  quantity = signal(0);
  sectionsByDivId = signal([]);
  brand = signal<any>([]);
  chipsetBrand = signal<any>([]);

  batchDetails = signal<any | null>(null);

  tabletForm!: FormGroup;

  constructor() {
    this.tabletForm = this.createTabletForm();

    this.requestAuth.getAllTabletBrand().subscribe((res: any) => this.brand.set(res));
    this.requestAuth.getAllChipsetBrand().subscribe((res: any) => this.chipsetBrand.set(res));

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

  createTabletForm(): FormGroup {
    return new FormGroup({
      batch_id: new FormControl<number | null>(null),
      section_id: new FormControl<number | null>(null, [Validators.required]),
      serial_number: new FormControl<string | null>(null),
      ups_id: new FormControl<number | any>(null),
      storageDTO: new FormArray([this.createStorageGroup()]),
      ramDTO: new FormArray([this.createRamGroup()]),
      gpu_id: new FormControl<number | null>(null, [Validators.required]),
      chipsetDTO: new FormGroup({
        brand_id: new FormControl<number | null>(null, [Validators.required]),
        model: new FormControl<string | null>(null, [Validators.required])
      }),
      brand_id: new FormControl<number | null>(null, [Validators.required]),
      model: new FormControl<string | null>(null, [Validators.required]),
      connectionDTO: new FormControl<number[] | null>([], [Validators.required]),
      peripheralDTO: new FormControl<number[] | null>([], [Validators.required]),
      accountable_user: new FormControl<string | null>(null),
      co_accountable_user: new FormControl<string | null>(null)
    });
  }

  getSelectedUPS(event: any): void {
    const node = event.node;

    console.log(node.data);
  }

  getSectionSelectValue(event: any): void {
    this.requestAuth.getSectionsByDivisionId(event.value).subscribe(
      (res: any) => this.sectionsByDivId.set(res)
    );
  }

  // ---- RAM ----
  createRamGroup(): FormGroup {
    return new FormGroup({
      capacity_id: new FormControl<number | null>(null, [Validators.required])
    });
  }

  get ramArray(): FormArray {
    return this.tabletForm.get('ramDTO') as FormArray;
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
    return this.tabletForm.get('storageDTO') as FormArray;
  }

  addStorage(): void {
    this.storageArray.push(this.createStorageGroup());
  }

  removeStorage(index: number): void {
    if (this.storageArray.length > 1) {
      this.storageArray.removeAt(index);
    }
  }

  postTablet(): void {
    const rawValue: any = this.tabletForm.value;
    rawValue.batch_id = this.batchDetails().id;
    rawValue.serial_number = rawValue.serial_number || null;

    const tasks: Observable<any>[] = [];

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

    // Wait for all entity creation before posting Computer
    forkJoin(tasks.length ? tasks : [of(null)]).subscribe({
      next: () => {
        const duplicatedArray = Array.from({ length: this.quantity() }, () => structuredClone(rawValue));
        this.requestAuth.postComputer(duplicatedArray).subscribe({
          next: (res: any) => {
            this.notification.add({ severity: 'success', summary: 'Success', detail: 'Saved' });
            const updatedList = [...this.signalService.currentBatchData(), ...res.devices];
            this.signalService.addedDevice.set(res.devices);
            this.signalService.currentBatchData.set(updatedList);
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

  backButton(): void {
    this.router.navigate(['/batch-list/batch-details']);
  }
}
