import { Component, OnInit, Output, Input, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParamsService } from '../../util/services/params.service';

@Component({
    selector: 'app-connections',
    standalone: true,
    imports: [
        CommonModule
    ],
    providers: [
        ParamsService
    ],
    templateUrl: './connections.component.html',
    styleUrl: './connections.component.scss'
})
export class ConnectionsComponent implements OnInit, OnChanges {
    @Output() connectionsStateChanged = new EventEmitter<number[]>();
    @Input() isEnabled: boolean = true;

    fetchedConnections!: any;

    enabled = true;

    constructor(private params: ParamsService) { }

    ngOnInit(): void {
        this.params.getConnections().subscribe(res => this.fetchedConnections = res);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isEnabled']) {
            this.enabled = changes['isEnabled'].currentValue;
        }
    }

    //POST
    onCheckboxChange(connection: any, event: Event): void {
        const input = event.target as HTMLInputElement;
        connection.checked = input.checked;

        const checkIds = this.fetchedConnections
        .filter((i: any) => i.checked)
        .map((i: any) => i.id);

        this.connectionsStateChanged.emit(checkIds);
    }

}
