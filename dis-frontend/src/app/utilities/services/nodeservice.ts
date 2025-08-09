import { Injectable, inject } from '@angular/core';

import { switchMap, forkJoin, map, of, Observable } from 'rxjs';

import { Requestservice } from './requestservice';

@Injectable({
  providedIn: 'root'
})
export class Nodeservice {
  requestAuth = inject(Requestservice);

  getTreeNodesData(): Observable<any[]> {
    return this.requestAuth.getAllBatches().pipe(
      switchMap((batches) => {
        if (!batches.length) return of([]); // No batches → empty array

        const batchRequests = batches.map((batch, batchIndex) =>
          this.requestAuth.getAllUPSByBatchId(batch.id).pipe(
            map((upsList) => ({
              key: `${batchIndex}`,
              label: batch.batch_id,
              data: `Batch ${batch.name}`,
              icon: 'pi pi-fw pi-list',
              selectable: false,
              children: upsList.map((ups, upsIndex) => ({
                  key: `${batchIndex}-${upsIndex}`,
                  label: ups.device_number,
                  data: ups.id,
                  icon: 'pi pi-fw pi-bolt'
              }))
            }))
          )
        );

        if (batchRequests.length === 0) {
          return of([]);
        }

        return forkJoin(batchRequests);
      })
    );
  }
}
