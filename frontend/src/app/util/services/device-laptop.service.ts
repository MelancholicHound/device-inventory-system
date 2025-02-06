import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, first, throwIfEmpty } from 'rxjs/operators';

import { ErrorHandlerService } from './error-handler.service';

@Injectable({
    providedIn: 'root'
})
export class DeviceLaptopService {
    private url = 'http://192.168.1.86:8082/api/v1/dis';
    private token = localStorage.getItem('token');

    httpOptions: { headers: HttpHeaders } = {
        headers: new HttpHeaders({
            'Content-Type' : 'application/json',
            'Authorization' : `Bearer ${this.token}`
        })
    }

    constructor(private http: HttpClient,
                private errorHandler: ErrorHandlerService) { }

    //GET
    getAllByBatchId(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/device/laptops/batch/${id}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on getting all laptops by Batch ID.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getById(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/device/laptops/${id}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on getting laptop by ID.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getAllDevice(isCondemned: boolean): Observable<any> {
        return this.http.get<any>(`${this.url}/device/laptops?isCondemned=${isCondemned}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on getting all laptops.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getAllActiveDevice(): Observable<any> {
        return this.getAllDevice(false);
    }


    getAllCondemnedDevice(): Observable<any> {
        return this.getAllDevice(true);
    }

    getLaptopBrands(): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/laptop-brands`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on getting laptop brands.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //POST
    postLaptopBrand(brand: string): Observable<any> {
        return this.http.post<any>(`${this.url}/specs/laptop-brands?brand=${brand}`, null, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on posting laptop brand.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    postDevice(form: any): Observable<any> {
        return this.http.post<any>(`${this.url}/device/laptops/save-all`, form, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on posting laptop.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //PUT
    updateDevice(form: any, id: any): Observable<any> {
        return this.http.put<any>(`${this.url}/device/laptops/${id}`, form, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on updating laptop details.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //PATCH (condemn unit)
    condemnDevice(data: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/laptops/${data.id}?reason=${data.reason}&condemnedAt=${data.condemnedAt}`, null, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on condemning laptop.';
            return throwError(() => new Error(errorMessage));
        }));
    }
    //PATCH (change from existing condemned unit)
    changeWithExistingProcessor(data: any): Observable<any> {
      return this.http.patch<any>(`${this.url}/device/laptops/${data.toDeviceId}/change/cpu/${data.fromDeviceId}`, null, this.httpOptions)
      .pipe(catchError((error: any) => {
          const errorMessage = error?.error?.message || 'Error on changing with existing processor.';
          return throwError(() => new Error(errorMessage));
      }));
  }

    changeWithExistingGPU(data: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/laptops/${data.toDeviceId}/change/video-card/${data.fromDeviceId}`, null, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on changing with existing video card.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    changeWithExistingStorage(data: any, params: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/laptops/${data.toDeviceId}/change/storage/${data.fromDeviceId}?fromStorageId=${params.fromStorageId}&toStorageId=${params.toStorageId}`, null, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on changing with existing storage.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    changeWithExistingRAM(data: any, params: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/laptops/${data.toDeviceId}/change/ram/${data.fromDeviceId}?fromRAMId=${params.fromStorageId}&toRAMId=${params.toStorageId}`, null, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on changing with existing RAM.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //PATCH (change from new parts)
    changeWithNewProcessor(toDeviceId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/laptops/${toDeviceId}/change/cpu`, form, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on changing with new processor.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    changeWithNewGPU(toDeviceId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/laptops/${toDeviceId}/change/video-card`, form, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on changing with new video card.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    changeWithNewStorage(toDeviceId: any, toStorageId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/laptops/${toDeviceId}/change/storage?oldStorageId=${toStorageId}`, form, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on changing with new storage.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    changeWithNewRAM(toDeviceId: any, toRAMId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/laptops/${toDeviceId}/change/ram?oldRAMId=${toRAMId}`, form, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on changing with new RAM.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //PATCH (upgrade from existing unit)
    upgradeWithExistingRAM(toDeviceId: any, condemnForm: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/laptops/${toDeviceId}/upgrade/ram/${condemnForm.fromDeviceId}?fromRAMId=${condemnForm.ramId}`, null, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on upgrading with existing RAM.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    upgradeWithExistingStorage(toDeviceId: any, condemnForm: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/laptops/${toDeviceId}/upgrade/storage/${condemnForm.fromDeviceId}?fromStorageId=${condemnForm.storageId}`, null, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on upgrading with existing storage.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //PATCH (upgrade with new parts)
    upgradeWithNewRAM(toDeviceId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/laptops/${toDeviceId}/upgrade/ram`, form, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on upgrading with new RAM.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    upgradeWithNewStorage(toDeviceId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/laptops/${toDeviceId}/upgrade/storage`, form, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on upgrading with new storage.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //DELETE
    deleteById(id: any): Observable<any> {
        return this.http.delete<any>(`${this.url}/device/laptops/${id}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on deleting laptop.';
            return throwError(() => new Error(errorMessage));
        }));
    }
}
