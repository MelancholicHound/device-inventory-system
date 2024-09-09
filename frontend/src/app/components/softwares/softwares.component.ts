import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';

import { ParamsService } from '../../util/services/params.service';

@Component({
  selector: 'app-softwares',
  standalone: true,
  imports: [
      NgFor
  ],
  providers: [
      ParamsService
  ],
  templateUrl: './softwares.component.html',
  styleUrl: './softwares.component.scss'
})
export class SoftwaresComponent implements OnInit {
    fetchedOS!: any; fetchedSecurity!: any; fetchedProdTool!: any;

    constructor(private params: ParamsService) { }

    ngOnInit(): void {
        this.params.getOS().subscribe(res => this.fetchedOS = res);
        this.params.getSecurity().subscribe(res => this.fetchedSecurity = res);
        this.params.getProdTools().subscribe(res => this.fetchedProdTool = res);
    }
}
