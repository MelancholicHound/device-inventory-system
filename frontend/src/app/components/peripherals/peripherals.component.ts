import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ParamsService } from '../../util/services/params.service';
import { SpecsService } from '../../util/services/specs.service';
import { TransactionService } from '../../util/services/transaction.service';

@Component({
    selector: 'app-peripherals',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    providers: [
        ParamsService,
        SpecsService
    ],
    templateUrl: './peripherals.component.html',
    styleUrl: './peripherals.component.scss'
})
export class PeripheralsComponent implements OnInit, OnChanges {
    @Output() peripheralsStateChanged: EventEmitter<number[]> = new EventEmitter<number[]>();
    @Output() upsBrandId: EventEmitter<number> = new EventEmitter<number>();
    @Input() isEnabled: boolean = true;
    @Input() peripheralsPayload: any[] = [];

    fetchedPeripherals!: any;
    fetchedUPS: any; fetchedUPSBrand: any;
    upsForm!: FormGroup;

    peripheralId: number[] = [1];

    enabled: boolean = true;
    enabledUPS: boolean = false;

    constructor(private params: ParamsService,
                private specs: SpecsService,
                private transaction: TransactionService) { }

    ngOnInit(): void {
        this.upsForm = this.createUPSFormGroup(this.peripheralId);

        this.params.getPeripherals().subscribe({
            next: (data: any) => {
                this.fetchedPeripherals = data.map((object: any) => ({
                    id: object.id,
                    name: object.name.toLowerCase(),
                    checked: (this.peripheralsPayload || []).some(
                        (fetched: any) => fetched.id === object.id
                    )
                }));

                for (let i = 0; i < this.fetchedPeripherals.length; i++) {
                    if (this.fetchedPeripherals[i].name === 'e pen') {
                        this.fetchedPeripherals[i].name = 'E Pen';
                    }
                }
            },
            error: (error: any) => { console.log(error) }
        });

        this.specs.getAllUPS().subscribe({
            next: (data: any) => { this.fetchedUPS = data },
            error: (error: any) => { console.log(error) }
        });

        this.specs.getUPSBrand().subscribe({
            next: (data: any) => { this.fetchedUPSBrand = data },
            error: (error: any) => { console.log(error) }
        })

        if (this.peripheralsPayload) {
            this.updateCheckedState();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isEnabled']) {
            this.enabled = changes['isEnabled'].currentValue;
            if (!this.enabled) {
                this.uncheckAll();
            }
        }

        if (changes['peripheralsPayload'] && !changes['peripheralsPayload'].firstChange) {
            this.updateCheckedState();
        }
    }

    createUPSFormGroup(predefinedArray: number[]): FormGroup {
        const peripheralIdsArray = new FormArray(
            predefinedArray.map(id => new FormControl(id, [Validators.required, Validators.pattern('^[0-9]*$')]))
        );

        return new FormGroup({
            batchId: new FormControl(null, [Validators.pattern('^[0-9]*$')]),
            sectionId: new FormControl(null, [Validators.pattern('^[0-9]*$')]),
            brandId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            serialNumber: new FormControl(null, [Validators.required]),
            peripheralIds: peripheralIdsArray,
            model: new FormControl(null, [Validators.required]),
            kilovolts: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')])
        });
    }

    updateCheckedState(): void {
        if (this.fetchedPeripherals) {
            this.fetchedPeripherals.forEach((connection: any) => {
                connection.checked = this.peripheralsPayload.some(
                    (fetched: any) => fetched.id === connection.id
                );
            });
        }
    }

    uncheckAll(): void {
        this.fetchedPeripherals.forEach((connection: any) => {
            connection.checked = false;
        });
    }

    //GET
    getUPSValue() {
        let value = document.getElementById('ups-brand') as HTMLOptionElement;
        this.upsBrandId.emit(parseInt(value.value, 10));
    }

    //POST
    onCheckboxChange(peripherals: any, event: Event): void {
        const input = event.target as HTMLInputElement;
        peripherals.checked = input.checked;

        const checkedIds = this.fetchedPeripherals
        .filter((i: any) => i.checked)
        .map((i: any) => i.id);

        this.peripheralsStateChanged.emit(checkedIds);
    }

    saveUPSDetails(): void {
        const payload = history.state.inventorydetails;

        this.upsForm.patchValue({ batchId: history.state.batchid ? history.state.batchid : payload.batchId });
        this.upsForm.patchValue({ brandId: parseInt(this.upsForm.get('brandId')?.value, 10) });
        this.upsForm.patchValue({ sectionId: this.transaction.sectionId() });

        this.params.postUPS(this.upsForm.value).subscribe({
            error: (error: any) => { console.error(error) }
        });
    }

    //Other functions
    changeUPS(event: Event) {
        let inputElement = event.target as HTMLInputElement;

        if (inputElement.checked) {
            this.enabledUPS = true;
        } else {
            this.enabledUPS = false;
            let upsBrandSelect = document.getElementById('ups-brand') as HTMLSelectElement;
            upsBrandSelect.selectedIndex = 0;
        }
    }
}
