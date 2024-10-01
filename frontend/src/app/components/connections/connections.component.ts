import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
    @Output() checkboxStateChanged = new EventEmitter<number[]>();

    fetchedConnections!: any;

    constructor(private params: ParamsService) { }

    ngOnInit(): void {
        this.params.getConnections().subscribe(res => this.fetchedConnections = res);
    }

    onCheckboxChange(connection: any, event: Event): void {
        const input = event.target as HTMLInputElement;
        connection.checked = input.checked;

        const checkIds = this.fetchedConnections
        .filter((i: any) => i.checked)
        .map((i: any) => i.id);

        this.checkboxStateChanged.emit(checkIds);
    }

}
