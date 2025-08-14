import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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

interface Functionality {
  name: string;
  response: boolean;
}

@Component({
  selector: 'app-printer',
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
  templateUrl: './printer.html',
  styleUrl: './printer.css'
})
export class DevicePrinter {
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
  brand = signal<any>([]);
  batchDetails = signal<any | null>(null);
  printerType = signal<any>([]);

  printerForm!: FormGroup;

  withScanner: Functionality[] = [
    { name: 'Scan Capable', response: true },
    { name: 'Print Only', response: true }
  ];

  constructor() {
    this.printerForm = this.createPrinterForm();

    this.requestAuth.getAllPrinterBrand().subscribe((res: any) => this.brand.set(res));
    this.requestAuth.getPrinterTypes().subscribe((res: any) => this.printerType.set(res));

    const navigation = this.router.getCurrentNavigation();

    if (navigation?.extras.state) {
      this.quantity.set(navigation.extras.state['count']);
    }

    effect(() => {
      if (this.signalService.batchDetails()) {
        this.batchDetails.set(this.signalService.batchDetails());
      }
    });
  }

  createPrinterForm(): FormGroup {
    return new FormGroup({
      batch_id: new FormControl<number | null>(null),
      section_id: new FormControl<number | null>(null, [Validators.required]),
      serial_number: new FormControl<string | null>(null),
      brand_id: new FormControl<number | null>(null, [Validators.required]),
      model: new FormControl<string | null>(null, [Validators.required]),
      type_id: new FormControl<string | null>(null, [Validators.required]),
      with_scanner: new FormControl<boolean | null>(null, [Validators.required]),
      accountable_user: new FormControl<string | null>(null),
      co_accountable_user: new FormControl<string | null>(null)
    });
  }

  getSectionSelectValue(event: any): void {
    this.requestAuth.getSectionsByDivisionId(event.value).subscribe(
      (res: any) => this.sectionsByDivId.set(res)
    );
  }

  postPrinter(): void {
    const rawValue: any = this.printerForm.value;
    rawValue.batch_id = this.batchDetails().id;
    rawValue.serial_number = rawValue.serial_number || null;
    const duplicatedArray = Array.from({ length: this.quantity() }, () => structuredClone(rawValue));

    this.requestAuth.postPrinter(duplicatedArray).subscribe({
      next: (res: any) => {
        this.notification.add({
          severity: 'success',
          summary: 'Success',
          detail: `${duplicatedArray.length} printer/s saved successfully.`
        });

        const updatedList = [...this.signalService.currentBatchData(), ...res.devices];
        this.signalService.addedDevice.set(res.devices);
        this.signalService.currentBatchData.set(updatedList);
        this.router.navigate(['/batch-list/batch-details']);
      },
      error: (error: any) => {
        this.notification.add({ severity: 'error', summary: 'Error', detail: String(error) });
      }
    });
  }

  backButton(event: Event): void {
    if (this.printerForm.dirty) {
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
