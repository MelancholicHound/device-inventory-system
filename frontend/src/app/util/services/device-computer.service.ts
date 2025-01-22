import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, first } from 'rxjs/operators';

import { ErrorHandlerService } from './error-handler.service';

@Injectable({
    providedIn: 'root'
})
export class DeviceComputerService {
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
        return this.http.get<any>(`${this.url}/device/computers/batch/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`device/computers/batch`)));
    }

    getById(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/device/computers/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`device/computers`)));
    }

    getAllDevice(isCondemned: boolean): Observable<any> {
        return this.http.get<any>(`${this.url}/device/computers?isCondemned=${isCondemned}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/computer')));
    }

    getAllActiveDevice(): Observable<any> {
        return this.getAllDevice(false);
    }

    getAllCondemnedDevice(): Observable<any> {
        return this.getAllDevice(true);
    }

    //POST
    postDevice(form: any): Observable<any> {
        return this.http.post<any>(`${this.url}/device/computers/save-all`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/computers/save-all')));
    }

    searchFilter(form: any, isCondemned: boolean): Observable<any> {
        return this.http.post<any>(`${this.url}/device/computers/search?isCondemned=${isCondemned}`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/computers/search')));
    }

    //PUT
    updateDevice(form: any, id: any): Observable<any> {
        return this.http.put<any>(`${this.url}/device/computers/${id}`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/computers')));
    }

    //PATCH (condemn unit)
    condemnDevice(data: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${data.id}?reason=${data.reason}&condemnedAt=${data.condemnedAt}`, null, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An unknown error occured.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //PATCH (change from existing condemned unit)
    changeWithExistingProcessor(data: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${data.toDeviceId}/change/cpu/${data.fromDeviceId}`, null, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An unknown error occured.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    changeWithExistingGPU(data: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${data.toDeviceId}/change/video-card/${data.fromDeviceId}`, null, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An unknown error occured.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    changeWithExistingStorage(data: any, params: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${data.toDeviceId}/change/storage/${data.fromDeviceId}?fromStorageId=${params.fromStorageId}&toStorageId=${params.toStorageId}`, null, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An unknown error occured.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    changeWithExistingRAM(data: any, params: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${data.toDeviceId}/change/ram/${data.fromDeviceId}?fromRAMId=${params.fromStorageId}&toRAMId=${params.toStorageId}`, null, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An unknown error occured.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //PATCH (change from new parts)
    changeWithNewProcessor(toDeviceId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${toDeviceId}/change/cpu`, form, this.httpOptions)
        .pipe(catchError(this.errorHandler.handleError<any>('device/computers')));
    }

    changeWithNewGPU(toDeviceId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${toDeviceId}/change/video-card`, form, this.httpOptions)
        .pipe(catchError(this.errorHandler.handleError<any>('device/computers')));
    }

    changeWithNewStorage(toDeviceId: any, toStorageId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${toDeviceId}/change/storage?oldStorageId=${toStorageId}`, form, this.httpOptions)
        .pipe(catchError(this.errorHandler.handleError<any>('device/computers')));
    }

    changeWithNewRAM(toDeviceId: any, toRAMId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${toDeviceId}/change/ram?oldRAMId=${toRAMId}`, form, this.httpOptions)
        .pipe(catchError(this.errorHandler.handleError<any>('device/computers')));
    }

    //PATCH (upgrade from existing unit)
    upgradeWithExistingRAM(toDeviceId: any, condemnForm: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${toDeviceId}/upgrade/ram/${condemnForm.fromDeviceId}?fromRAMId=${condemnForm.ramId}`, null, this.httpOptions)
        .pipe(catchError(this.errorHandler.handleError<any>('device/computers')));
    }

    upgradeWithExistingStorage(toDeviceId: any, condemnForm: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${toDeviceId}/upgrade/storage/${condemnForm.fromDeviceId}?fromStorageId=${condemnForm.storageId}`, null, this.httpOptions)
        .pipe(catchError(this.errorHandler.handleError<any>('device/computers')));
    }

    //PATCH (upgrade with new parts)
    upgradeWithNewRAM(toDeviceId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${toDeviceId}/upgrade/ram`, form, this.httpOptions)
        .pipe(catchError(this.errorHandler.handleError<any>('device/computers')));
    }

    upgradeWithNewStorage(toDeviceId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${toDeviceId}/upgrade/storage`, form, this.httpOptions)
        .pipe(catchError(this.errorHandler.handleError<any>('device/computers')));
    }

    //DELETE
    deleteById(id: any): Observable<any> {
        return this.http.delete<any>(`${this.url}/device/computers/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/computers')));
    }
}
