import { Component, OnInit, effect, inject, signal } from '@angular/core';
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

import { firstValueFrom } from 'rxjs';

import { Request } from '../../../utilities/services/request';
import { Signal } from '../../../utilities/services/signal';

import { Store } from '../../../utilities/services/store';

interface TreeNode {
  key: string;
  label: string;
  children?: TreeNode[];
}

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
  router = inject(Router);
  requestAuth = inject(Request);
  signalService = inject(Signal);
  storage = inject(Store);
  notification = inject(MessageService);
  fb = inject(FormBuilder);

  quantity = signal(0);
  sectionsByDivId = signal([]);
  seriesByBrandId = signal([]);
  brand = signal<any>([]);
  batchDetails = signal<any | null>(null);

  ramList = signal<Array<any>>([{}]);
  storageList = signal<Array<any>>([{}]);

  treeData = signal<TreeNode[]>([]);
  selectedUPS = signal<string | null>(null)

  aioForm!: FormGroup;

  constructor() {
    this.aioForm = this.createAIOForm();

    this.requestAuth.getAllAIOBrand().subscribe((res: any) => this.brand.set(res));

    const navigation = this.router.getCurrentNavigation();

    if (navigation?.extras.state) {
      this.quantity.set(navigation.extras.state['count']);
    }

    effect(() => {
      if (this.signalService.batchData()) {
        this.batchDetails.set(this.signalService.batchData());
      }
    });
  }

  async ngOnInit() {
    await this.loadTreeData();
  }

  createAIOForm(): FormGroup {
    return new FormGroup({
      batch_id: new FormControl<number>(this.batchDetails()?.id),
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

  async loadTreeData() {
    const batches = await firstValueFrom(this.requestAuth.getAllBatches());
    const treeNodes: TreeNode[] = [];

    for (const batch of batches) {
      const upsList = await firstValueFrom(
        this.requestAuth.getAllUPSByBatchId(batch.id)
      );

      treeNodes.push({
        key: `batch-${batch.id}`,
        label: batch.batch_id,
        children: upsList.map((ups: any) => ({
          key: String(ups.id),
          label: ups.device_number
        }))
      });
    }

    this.treeData.set(treeNodes);
    console.log(treeNodes);
  }

  submitSelection() {
    console.log(this.selectedUPS());
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

  handleBrandInput(event: any): void {
    const inputValue = event.target.value?.trim();

    const match = this.brand().some((b: any)=> b?.name.toUpperCase() === inputValue.toUpperCase());

    if (!match && inputValue) {
      this.postNewBrand(inputValue);
    }
  }

  postNewBrand(name: string): void {
    this.requestAuth.postAIOBrand(name).subscribe({
      next: (res: any) => {
        this.aioForm.patchValue({ brand_id: res.id });
        this.notification.add({
          severity: 'success',
          summary: 'Success',
          detail: `${res.name}`
        });
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

  // ---- RAM ----
  createRamGroup(): FormGroup {
    return this.fb.group({
      capacity_id: [null, Validators.required]
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
    return this.fb.group({
      capacity_id: [null, Validators.required],
      type_id: [null, Validators.required]
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
    console.log(this.aioForm.value);
  }
}
