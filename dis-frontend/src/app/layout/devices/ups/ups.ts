import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
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
import { InputNumber } from 'primeng/inputnumber';

import { Requestservice } from '../../../utilities/services/requestservice';
import { Signalservice } from '../../../utilities/services/signalservice';
import { Nodeservice } from '../../../utilities/services/nodeservice';

@Component({
  selector: 'app-ups',
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
    ConfirmDialog,
    InputNumber
  ],
  templateUrl: './ups.html',
  styleUrl: './ups.css'
})
export class Ups {
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
  volt_amperes = signal<any>([]);

  upsForm!: FormGroup;

  constructor() {
    this.upsForm = this.createUPSForm();

    this.requestAuth.getAllUPSBrand().subscribe((res: any) => this.brand.set(res));

    const navigation = this.router.getCurrentNavigation();

    if (navigation?.extras.state) {
      this.quantity.set(navigation.extras.state['count']);
    }

    effect(() => {
      if (this.signalService.batchDetails()) {
        this.batchDetails.set(this.signalService.batchDetails());
      }
    })
  }

  createUPSForm(): FormGroup {
    return new FormGroup({
      batch_id: new FormControl<number | null>(null),
      section_id: new FormControl<number | null>(null, [Validators.required]),
      serial_number: new FormControl<string | null>(null),
      brand_id: new FormControl<number | null>(null, [Validators.required]),
      model: new FormControl<string | null>(null, [Validators.required]),
      volt_amperes: new FormControl<number | null>(null, [Validators.required]),
      accountable_user: new FormControl<string | null>(null),
      co_accountable_user: new FormControl<string | null>(null)
    });
  }

  getSectionSelectValue(event: any): void {
    this.requestAuth.getSectionsByDivisionId(event.value).subscribe(
      (res: any) => this.sectionsByDivId.set(res)
    );
  }

  postUPS(): void {

  }

  backButton(event: Event): void {
    if (this.upsForm.dirty) {
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
