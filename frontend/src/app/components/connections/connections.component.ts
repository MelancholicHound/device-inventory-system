import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';

import { ParamsService } from '../../util/services/params.service';

@Component({
    selector: 'app-connections',
    standalone: true,
    imports: [
        NgFor
    ],
    providers: [
        ParamsService
    ],
    templateUrl: './connections.component.html',
    styleUrl: './connections.component.scss'
})
export class ConnectionsComponent implements OnInit {
    fetchedConnections!: any;

    constructor(private params: ParamsService) { }

    ngOnInit(): void {
        this.params.getConnections().subscribe(res => this.fetchedConnections = res);
    }
}
