import { Component, OnInit, Output, Input, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParamsService } from '../../util/services/params.service';
import { SpecsService } from '../../util/services/specs.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-peripherals',
    standalone: true,
    imports: [
        CommonModule
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

    fetchedPeripherals: any; fetchedUPSBrand: any;
    upsForm!: FormGroup;

    enabled: boolean = true;
    enabledUPS: boolean = false;

    constructor(private params: ParamsService,
                private specs: SpecsService) { }

    ngOnInit(): void {
        this.upsForm = this.createUPSFormGroup();

        this.params.getPeripherals().subscribe({
            next: (data: any) => {
                this.fetchedPeripherals = data.map((object: any) => ({
                    id: object.id,
                    name: object.name.toLowerCase()
                }));

                for (let i = 0; i < this.fetchedPeripherals.length; i++) {
                    if (this.fetchedPeripherals[i].name === 'e pen') {
                        this.fetchedPeripherals[i].name = 'E Pen';
                    }
                }
            },
            error: (error: any) => { console.log(error) }
        });

        this.specs.getUPSBrand().subscribe({
            next: (data: any) => { this.fetchedUPSBrand = data },
            error: (error: any) => { console.log(error) }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isEnabled']) {
            this.enabled = changes['isEnabled'].currentValue;
            if (!this.enabled) {
                this.uncheckAll();
            }
        }
    }

    createUPSFormGroup(): FormGroup {
        return new FormGroup({
            batchId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            sectionId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            brandId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            model: new FormControl(null, [Validators.required]),
            kilovolts: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')])
        });
    }

    uncheckAll(): void {
        this.fetchedPeripherals.forEach((connection: any) => {
            connection.checked = false;
        });
    }

    //GET
    getUPSBrandValue() {
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
