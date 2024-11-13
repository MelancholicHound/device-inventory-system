import { Component, AfterViewInit, ViewChild, OnInit, ElementRef } from '@angular/core';
import { NgFor } from '@angular/common';
import { Router } from '@angular/router';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { ParamsService } from '../../util/services/params.service';

export interface TableDevice {
    tag: string;
    device: string;
    division: string;
    section: string;
}

@Component({
    selector: 'app-add-batch',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        NgFor
    ],
    providers: [
        ParamsService
    ],
    templateUrl: './add-batch.component.html',
    styleUrl: './add-batch.component.scss'
})
export class AddBatchComponent implements AfterViewInit, OnInit {
    displayedColumns: string[] = ['tag', 'device', 'division', 'section', 'settings'];
    devices: any[] = [
        { name: 'Computer', indicator: 'computer' },
        { name: 'Laptop', indicator: 'laptop' },
        { name: 'Tablet', indicator: 'tablet' },
        { name: 'Printer', indicator: 'printer' },
        { name: 'Router', indicator: 'router' },
        { name: 'Scanner', indicator: 'scanner' },
        { name: 'AIO', indicator: 'aio' },
        { name: 'Server', indicator: 'server' }
    ];
    dataSource!: MatTableDataSource<TableDevice>;

    batchDetails: any;
    state: any = localStorage.getItem('state');
    batchEditDetails: any; batchAddDetails: any; batchViewDetails: any;
    fetchedData!: any[]; deviceSelected: any;
    isAddingBatch!: boolean; isViewingBatch!: boolean;

    aioData!: any; computerData!: any;
    laptopData!: any; printerData!: any;
    routerData!: any; scannerData!: any;
    serverData!: any; tabletData!: any;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('addDeviceModal') addDeviceModal!: ElementRef;

    constructor(private router: Router,
                private _params: ParamsService) {
                this.dataSource = new MatTableDataSource(this.fetchedData);
                const navigation = this.router.getCurrentNavigation();
                if (navigation?.extras.state) {
                    this.batchViewDetails = navigation.extras.state['viewdetails']
                    this.batchEditDetails = navigation.extras.state['editdetails'];
                    this.batchAddDetails = navigation.extras.state['addbatch'];
                    this.batchDetails = navigation.extras.state['batchdetails'];
                }
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    ngOnInit(): void {
        if (this.batchAddDetails) {
            this.batchDetails = this.batchAddDetails;
            this.isAddingBatch = true;
            this.isViewingBatch = false;
        } else if (this.batchEditDetails) {
            this.batchDetails = this.batchEditDetails;
            this.isAddingBatch = false;
            this.isViewingBatch = false;
        } else if (this.batchViewDetails) {
            this.batchDetails = this.batchViewDetails;
            this.isViewingBatch = true;
            this.isAddingBatch = false;
        }

        if (this.state === 'ADD') {
            this.isAddingBatch = true;
            this.isViewingBatch = false;
        } else if (this.state === 'EDIT') {
            this.isAddingBatch = false;
            this.isViewingBatch = false;
        } else if (this.state === 'VIEW') {
            this.isViewingBatch = true;
            this.isAddingBatch = false;
        }
    }

    routeSelectedDevice() {
        var selected = document.getElementById('device') as HTMLSelectElement;
        let count = document.getElementById('count') as HTMLInputElement;
        for (let i = 0; i < this.devices.length; i++) {
            if (selected.value === this.devices[i].name) {
                this.router.navigate([`add-device/${this.devices[i].indicator}`], { state: {
                    device: this.devices[i].name,
                    batchdetails: this.batchDetails,
                    count: count.value,
                    batchnumber: this.batchDetails.formattedId,
                    batchid: this.batchDetails.id
                }});
                this.addDeviceModal.nativeElement.style.display = 'none';
                selected.selectedIndex = 0; count.value = '';
            }
        }
    }

    //To be configured into a warning modal
    backButton() {
        if (this.batchAddDetails) {
            this._params.getAllBatches().subscribe({
                next: (data: any) => {
                    for (let i = 0; i < data.length; i++) {
                        if (this.batchDetails.formattedId === data[i].formattedId) {
                            this._params.deleteBatch(data[i].id).subscribe({
                                next: () => { this.router.navigate(['batch-delivery']) },
                                error: (error: any) => { console.log(error) }
                            });
                        }
                    }
                },
                error: (error: any) => { console.log(error) }
            });
        } else {
          this.router.navigate(['/batch-delivery']);
        }
    }
}
