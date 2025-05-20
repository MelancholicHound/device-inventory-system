import { Component, ViewChild } from '@angular/core';

import { MessageService, SortEvent, MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputIconModule } from 'primeng/inputicon';
import { TableModule, Table } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { Menu, MenuClasses } from 'primeng/menu';

import { TableDevice } from '../../utilities/models/TableDevice';
import { TableUtilities } from '../../common';
import { Column } from '../../common';

@Component({
    selector: 'app-batch-details',
    imports: [
        TableModule,
        IconFieldModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        InputIconModule,
        Menu,
        Dialog
    ],
    templateUrl: './batch-details.component.html',
    styleUrl: './batch-details.component.scss'
})
export class BatchDetailsComponent {
    @ViewChild('deviceTable') deviceTable!: Table;

    activeDevice: any;
    dateSource!: TableDevice[];
    initialValue!: TableDevice[];
    selectedDevice!: TableDevice;
    columns: Column[] | undefined;
    deviceMenu: MenuItem[] | undefined;

    isSorted: boolean | null = null;

    first: number = 0;
    rows: number = 10;
    visible: boolean = false;

    tblUtilities = new TableUtilities();

    customSort(event: SortEvent): void {
        if (this.isSorted == null || this.isSorted === undefined) {
            this.isSorted = true;
            this.tblUtilities.sortTableData(event);
        } else if (this.isSorted == true) {
            this.isSorted = false;
            this.tblUtilities.sortTableData(event);
        } else if (this.isSorted == false) {
            this.isSorted = null;
            this.dateSource = [...this.initialValue];
            this.deviceTable.reset();
        }
    }

    showDialog(): void {
        this.visible = true;
    }
}
