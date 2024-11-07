import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParamsService } from '../../util/services/params.service';

@Component({
  selector: 'app-softwares',
  standalone: true,
  imports: [
      CommonModule
  ],
  providers: [
      ParamsService
  ],
  templateUrl: './softwares.component.html',
  styleUrl: './softwares.component.scss'
})
export class SoftwaresComponent implements OnInit, OnChanges {
    @Input() isEnabled: boolean = true;
    fetchedOS!: any; fetchedSecurity!: any; fetchedProdTool!: any;

    enabled = true;

    constructor(private params: ParamsService) { }

    ngOnInit(): void {
        this.params.getOS().subscribe(res => this.fetchedOS = res);
        this.params.getSecurity().subscribe(res => this.fetchedSecurity = res);
        this.params.getProdTools().subscribe(res => this.fetchedProdTool = res);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isEnabled']) {
            this.enabled = changes['isEnabled'].currentValue;
        }
    }
}
