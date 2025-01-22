import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, first } from 'rxjs/operators';

import { ErrorHandlerService } from './error-handler.service';

@Injectable({
    providedIn: 'root'
})
export class DeviceAioService {
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
    getAllByBatchId(id: any) : Observable<any> {
        return this.http.get<any>(`${this.url}/device/all-in-ones/batch/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`device/all-in-ones/batch`)));
    }

    getById(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/device/all-in-ones/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/all-in-ones')));
    }

    getAllDevice(isCondemned: boolean): Observable<any> {
        return this.http.get<any>(`${this.url}/device/all-in-ones?isCondemned=${isCondemned}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/all-in-ones')));
    }

    getAllActiveDevice(): Observable<any> {
        return this.getAllDevice(false);
    }

    getAllCondemnedDevice(): Observable<any> {
        return this.getAllDevice(true);
    }

    getAIOBrands(): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/aio-brands`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/aio-brands')));
    }

    //POST
    postAIOBrand(brand: string): Observable<any> {
        return this.http.post<any>(`${this.url}/specs/aio/aio-brands?brand=${brand}`, null, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`specs/aio/aio-brands?brand=${brand}`)));
    }

    postDevice(form: any): Observable<any> {
        return this.http.post<any>(`${this.url}/device/all-in-ones/save-all`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/all-in-ones/save-all')));
    }

    searchFilter(form: any, isCondemned: boolean): Observable<any> {
        return this.http.post<any>(`${this.url}/device/all-in-ones/search?isCondemned=${isCondemned}`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/all-in-ones/search')));
    }

    //PUT
    updateDevice(form: any, id: any): Observable<any> {
        return this.http.put<any>(`${this.url}/device/all-in-ones/${id}`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/all-in-ones')));
    }

    //PATCH (condemn unit)
    condemnDevice(data: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/all-in-ones/${data.id}?reason=${data.reason}&condemnedAt=${data.condemnedAt}`, null, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An unknown error occured.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //PATCH (change from existing condemned unit)
    changeWithExistingProcessor(data: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/all-in-ones/${data.toDeviceId}/change/cpu/${data.fromDeviceId}`, null, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An unknown error occured.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    changeWithExistingGPU(data: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/all-in-ones/${data.toDeviceId}/change/video-card/${data.fromDeviceId}`, null, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An unknown error occured.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    changeWithExistingStorage(data: any, params: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/all-in-ones/${data.toDeviceId}/change/storage/${data.fromDeviceId}?fromStorageId=${params.fromStorageId}&toStorageId=${params.toStorageId}`, null, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An unknown error occured.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    changeWithExistingRAM(data: any, params: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/all-in-ones/${data.toDeviceId}/change/ram/${data.fromDeviceId}?fromRAMId=${params.fromRAMId}&toRAMId=${params.toRAMId}`, null, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An unknown error occured.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //PATCH (change from new parts)
    changeWithNewProcessor(toDeviceId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/all-in-ones/${toDeviceId}/change/cpu`, form, this.httpOptions)
        .pipe(catchError(this.errorHandler.handleError<any>('device/all-in-ones')));
    }

    changeWithNewGPU(toDeviceId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/all-in-ones/${toDeviceId}/change/video-card`, form, this.httpOptions)
        .pipe(catchError(this.errorHandler.handleError<any>('device/all-in-ones')));
    }

    changeWithNewStorage(toDeviceId: any, toStorageId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/all-in-ones/${toDeviceId}/change/storage?oldStorageId=${toStorageId}`, form, this.httpOptions)
        .pipe(catchError(this.errorHandler.handleError<any>('device/all-in-ones')));
    }

    changeWithNewRAM(toDeviceId: any, toRAMId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/all-in-ones/${toDeviceId}/change/ram?oldRAMId=${toRAMId}`, form, this.httpOptions)
        .pipe(catchError(this.errorHandler.handleError<any>('device/all-in-ones')));
    }

    //PATCH (upgrade from existing unit)
    upgradeWithExistingRAM(toDeviceId: any, condemnForm: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/all-in-ones/${toDeviceId}/upgrade/ram/${condemnForm.fromDeviceId}?fromRAMId=${condemnForm.ramId}`, null, this.httpOptions)
        .pipe(catchError(this.errorHandler.handleError<any>('device/all-in-ones')));
    }

    upgradeWithExistingStorage(toDeviceId: any, condemnForm: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/all-in-ones/${toDeviceId}/upgrade/storage/${condemnForm.fromDeviceId}?fromStorageId=${condemnForm.storageId}`, null, this.httpOptions)
        .pipe(catchError(this.errorHandler.handleError<any>('device/all-in-ones')));
    }

    //PATCH (upgrade with new parts)
    upgradeWithNewRAM(toDeviceId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/all-in-ones/${toDeviceId}/upgrade/ram`, form, this.httpOptions)
        .pipe(catchError(this.errorHandler.handleError<any>('device/all-in-ones')));
    }

    upgradeWithNewStorage(toDeviceId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/all-in-ones/${toDeviceId}/upgrade/storage`, form, this.httpOptions)
        .pipe(catchError(this.errorHandler.handleError<any>('device/all-in-ones')));
    }

    //DELETE
    deleteById(id: any): Observable<any> {
        return this.http.delete<any>(`${this.url}/device/all-in-ones/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/all-in-ones')));
    }
}
