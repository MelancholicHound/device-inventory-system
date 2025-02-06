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
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on getting all computers by Batch ID.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getById(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/device/computers/${id}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on getting computer by ID.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getAllDevice(isCondemned: boolean): Observable<any> {
        return this.http.get<any>(`${this.url}/device/computers?isCondemned=${isCondemned}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on getting all computers.';
            return throwError(() => new Error(errorMessage));
        }));
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
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on posting computer.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //PUT
    updateDevice(form: any, id: any): Observable<any> {
        return this.http.put<any>(`${this.url}/device/computers/${id}`, form, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on updating computer details.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //PATCH (condemn unit)
    condemnDevice(data: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${data.id}?reason=${data.reason}&condemnedAt=${data.condemnedAt}`, null, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on condemning computer.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //PATCH (change from existing condemned unit)
    changeWithExistingProcessor(data: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${data.toDeviceId}/change/cpu/${data.fromDeviceId}`, null, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on changing with existing processor.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    changeWithExistingGPU(data: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${data.toDeviceId}/change/video-card/${data.fromDeviceId}`, null, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on changing with existing video card.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    changeWithExistingStorage(data: any, params: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${data.toDeviceId}/change/storage/${data.fromDeviceId}?fromStorageId=${params.fromStorageId}&toStorageId=${params.toStorageId}`, null, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on changing with existing storage.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    changeWithExistingRAM(data: any, params: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${data.toDeviceId}/change/ram/${data.fromDeviceId}?fromRAMId=${params.fromStorageId}&toRAMId=${params.toStorageId}`, null, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on changing with existing RAM.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //PATCH (change from new parts)
    changeWithNewProcessor(toDeviceId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${toDeviceId}/change/cpu`, form, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error in changing with new processor.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    changeWithNewGPU(toDeviceId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${toDeviceId}/change/video-card`, form, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error in changing with new video card.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    changeWithNewStorage(toDeviceId: any, toStorageId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${toDeviceId}/change/storage?oldStorageId=${toStorageId}`, form, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error in changing with new storage.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    changeWithNewRAM(toDeviceId: any, toRAMId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${toDeviceId}/change/ram?oldRAMId=${toRAMId}`, form, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error in changing with new RAM.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //PATCH (upgrade from existing unit)
    upgradeWithExistingRAM(toDeviceId: any, condemnForm: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${toDeviceId}/upgrade/ram/${condemnForm.fromDeviceId}?fromRAMId=${condemnForm.ramId}`, null, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error in upgrading with existing RAM.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    upgradeWithExistingStorage(toDeviceId: any, condemnForm: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${toDeviceId}/upgrade/storage/${condemnForm.fromDeviceId}?fromStorageId=${condemnForm.storageId}`, null, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error in upgrading with existing storage.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //PATCH (upgrade with new parts)
    upgradeWithNewRAM(toDeviceId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${toDeviceId}/upgrade/ram`, form, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error in upgrading with new RAM.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    upgradeWithNewStorage(toDeviceId: any, form: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/computers/${toDeviceId}/upgrade/storage`, form, this.httpOptions)
        .pipe(catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error in upgrading with new storage.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //DELETE
    deleteById(id: any): Observable<any> {
        return this.http.delete<any>(`${this.url}/device/computers/${id}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on deleting computer.';
            return throwError(() => new Error(errorMessage));
        }));
    }
}
