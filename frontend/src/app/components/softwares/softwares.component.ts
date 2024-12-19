import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormGroup, FormControl, Validators,ReactiveFormsModule } from '@angular/forms';

import { ParamsService } from '../../util/services/params.service';

@Component({
  selector: 'app-softwares',
  standalone: true,
  imports: [
      CommonModule,
      ReactiveFormsModule,
      FormsModule
  ],
  providers: [
      ParamsService
  ],
  templateUrl: './softwares.component.html',
  styleUrl: './softwares.component.scss'
})
export class SoftwaresComponent implements OnInit, OnChanges {
    @Output() softwareStateChanged: EventEmitter<any> = new EventEmitter<any>();
    @Input() isEnabled: boolean = true;
    @Input() softwaresPayload: any;

    fetchedOS!: any; fetchedSecurity!: any; fetchedProdTool!: any;

    enabled = true;

    softwareForm!: FormGroup;

    constructor(private params: ParamsService) { }

    ngOnInit(): void {
        this.softwareForm = this.createSoftwareFormGroup();

        this.params.getOS().subscribe(res => this.fetchedOS = res);
        this.params.getSecurity().subscribe(res => this.fetchedSecurity = res);
        this.params.getProdTools().subscribe(res => this.fetchedProdTool = res);

        if (this.softwaresPayload) {
            this.softwareForm.patchValue({ operatingSystemId: this.softwaresPayload?.operatingSystemDTO?.id || null });
            this.softwareForm.patchValue({ productivityToolId: this.softwaresPayload?.productivityToolDTO?.id || null });
            this.softwareForm.patchValue({ securityId: this.softwaresPayload?.securityDTO?.id || null });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isEnabled']) {
            this.enabled = changes['isEnabled'].currentValue;
            if (!this.enabled) {
                let operatingSystem = document.getElementById('os') as HTMLSelectElement;
                let security = document.getElementById('security') as HTMLSelectElement;
                let prodTools = document.getElementById('prod-tool') as HTMLSelectElement;

                operatingSystem.selectedIndex = 0;
                security.selectedIndex = 0;
                prodTools.selectedIndex = 0;

                this.softwareForm.reset();
                this.softwareStateChanged.emit(this.softwareForm.value);
            }
        }
    }

    createSoftwareFormGroup(): FormGroup {
        return new FormGroup({
            operatingSystemId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            productivityToolId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
            securityId: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')])
        });
    }

    onOperatingSystemChange() {
        let operatingSystem = document.getElementById('os') as HTMLOptionElement;
        this.softwareForm.patchValue({ operatingSystemId: parseInt(operatingSystem.value, 10) });
        this.softwareStateChanged.emit(this.softwareForm.value);
    }

    onSecurityChange() {
        let security = document.getElementById('security') as HTMLOptionElement;
        this.softwareForm.patchValue({ securityId: parseInt(security.value, 10) });
        this.softwareStateChanged.emit(this.softwareForm.value);
    }

    onProductivityToolsChange() {
        let prodTools = document.getElementById('prod-tool') as HTMLOptionElement;
        this.softwareForm.patchValue({ productivityToolId: parseInt(prodTools.value, 10) });
        this.softwareStateChanged.emit(this.softwareForm.value);
    }
}
