import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { TabsModule } from 'primeng/tabs';
import { MultiSelectModule } from 'primeng/multiselect';

import { Request } from '../../../utilities/services/request';
import { Signal } from '../../../utilities/services/signal';

import { Store } from '../../../utilities/services/store';

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
    MultiSelectModule
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

  quantity = signal(0);
  sectionsByDivId = signal([]);
  seriesByBrandId = signal([]);
  brand = signal<any>([]);
  batchDetails = signal<any | null>(null);

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

  ngOnInit(): void {

  }

  createAIOForm(): FormGroup {
    return new FormGroup({
      batch_id: new FormControl<number>(this.batchDetails()?.id),
      section_id: new FormControl<number | null>(null, [Validators.required]),
      serial_number: new FormControl<string | null>(null),
      ups_id: new FormControl<number | any>(null),
      storageDTO: new FormArray([], [Validators.required]),
      ramDTO: new FormArray([], [Validators.required]),
      gpu_id: new FormControl<number | null>(null, [Validators.required]),
      processorDTO: new FormGroup({
        series_id: new FormControl<number | null>(null, [Validators.required]),
        model: new FormControl<string | null>(null, [Validators.required])
      }),
      brand_id: new FormControl<number | null>(null, [Validators.required]),
      model: new FormControl<string | null>(null, [Validators.required])
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

  postAIO(): void {
    console.log(this.aioForm.value);
  }
}
