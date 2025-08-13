import { Component, OnInit, ChangeDetectorRef, effect, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { TabsModule } from 'primeng/tabs';
import { MultiSelectModule } from 'primeng/multiselect';
import { TreeSelect } from 'primeng/treeselect';

import { Requestservice } from '../../../utilities/services/requestservice';
import { Signalservice } from '../../../utilities/services/signalservice';
import { Nodeservice } from '../../../utilities/services/nodeservice';

@Component({
  selector: 'app-aio',
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
    TreeSelect
  ],
  templateUrl: './aio.html',
  styleUrl: './aio.css'
})
export class Aio implements OnInit {
  node: any[] = [];
  selectedNodes: any;

  router = inject(Router);
  requestAuth = inject(Requestservice);
  signalService = inject(Signalservice);
  notification = inject(MessageService);
  fb = inject(FormBuilder);
  nodeService = inject(Nodeservice);

  quantity = signal(0);
  sectionsByDivId = signal([]);
  seriesByBrandId = signal([]);
  brand = signal<any>([]);
  batchDetails = signal<any | null>(null);

  aioForm!: FormGroup;

  constructor(private cdr: ChangeDetectorRef) {
    this.aioForm = this.createAIOForm();

    this.requestAuth.getAllAIOBrand().subscribe((res: any) => this.brand.set(res));

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

  ngOnInit(): void {

  }

  createAIOForm(): FormGroup {
    return new FormGroup({
      batch_id: new FormControl<number | null>(null, [Validators.required]),
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
      brand_id: new FormControl<number | null>(null, [Validators.required]),
      model: new FormControl<string | null>(null, [Validators.required]),
      connectionDTO: new FormControl<number[] | null>([], [Validators.required]),
      peripheralDTO: new FormControl<number[] | null>([], [Validators.required]),
      os_id: new FormControl<number | null>(null, [Validators.required]),
      prod_id: new FormControl<number | null>(null, [Validators.required]),
      security_id: new FormControl<number | null>(null, [Validators.required]),
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
    return this.aioForm.get('ramDTO') as FormArray;
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
    return this.aioForm.get('storageDTO') as FormArray;
  }

  addStorage(): void {
    this.storageArray.push(this.createStorageGroup());
  }

  removeStorage(index: number): void {
    if (this.storageArray.length > 1) {
      this.storageArray.removeAt(index);
    }
  }

  postAIO(): void {
    const rawValue: any = this.aioForm.value;

    rawValue.batch_id = this.batchDetails().id;
    rawValue.serial_number = rawValue.serial_number === '' ? null : rawValue.serial_number;

    const processCapacities = (
      dtoArray: any[],
      existingList: { id: number; capacity: string }[],
      postFn: (capacity: number) => any
    ) => {
      const existingCapacities = existingList.map((e) => e.capacity);

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

      const newCapacities = Array.from(
        new Set<string>(
          dtoArray
            .filter((item) => typeof item.capacity_id === 'string')
            .map((item) => item.capacity_id)
            .filter((capacityId) => !existingCapacities.includes(capacityId))
        )
      );

      newCapacities.forEach((capacityId) => {
        postFn(Number(capacityId)).subscribe({
          next: (res: any) => {
            dtoArray.forEach((item) => {
              if (item.capacity_id === capacityId) {
                item.capacity_id = res.id;
              }
            });
          },
          error: (error: any) => {
            this.notification.add({
              severity: 'error',
              summary: 'Error',
              detail: String(error)
            });
          }
        });
      });
    };

    processCapacities(
      rawValue.ramDTO,
      this.signalService.ram(),
      (capacity) => this.requestAuth.postRAMCapacity(capacity)
    );

    processCapacities(
      rawValue.storageDTO,
      this.signalService.storage(),
      (capacity) => this.requestAuth.postStorageCapacity(capacity)
    );

    const duplicatedArray = Array.from({ length: this.quantity() }, () => ({
      ...structuredClone(rawValue)
    }));

    this.requestAuth.postAIO(duplicatedArray).subscribe({
      next: (res: any) => {
        this.notification.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Saved'
        });

        const updatedList = [...this.signalService.currentBatchData(), ...duplicatedArray];
        this.signalService.addedDevice.set(res.devices);
        this.signalService.currentBatchData.set(updatedList);
        this.router.navigate(['/batch-list/batch-details']);
      },
      error: (error: any) => {
        this.notification.add({
          severity: 'error',
          summary: 'Error',
          detail: `${error}`
        });
      }
    });
  }

  backButton(): void {
    this.router.navigate(['/batch-list/batch-details']);
  }
}
