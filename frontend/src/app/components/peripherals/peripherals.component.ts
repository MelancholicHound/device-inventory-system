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

    fetchedData: any; fetchedUPSBrand: any;
    upsForm!: FormGroup;

    enabled = true;

    constructor(private params: ParamsService,
                private specs: SpecsService) { }

    ngOnInit(): void {
        this.upsForm = this.createUPSFormGroup();

        this.params.getPeripherals().subscribe({
            next: (data: any) => {
                this.fetchedData = data.map((object: any) => ({
                    id: object.id,
                    name: object.name.toLowerCase()
                }));

                for (let i = 0; i < this.fetchedData.length; i++) {
                    if (this.fetchedData[i].name === 'e pen') {
                        this.fetchedData[i].name = 'E Pen';
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
        }
    }

    createUPSFormGroup(): FormGroup {
        return new FormGroup({
            batchId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            sectionId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            brandId: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
            model: new FormControl('', [Validators.required]),
            kilovolts: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')])
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

        const checkedIds = this.fetchedData
        .filter((i: any) => i.checked)
        .map((i: any) => i.id);

        this.peripheralsStateChanged.emit(checkedIds);
    }


}
