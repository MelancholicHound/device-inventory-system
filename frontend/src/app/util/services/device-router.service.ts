import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, first } from 'rxjs/operators';

import { ErrorHandlerService } from './error-handler.service';

@Injectable({
    providedIn: 'root'
})

export class DeviceRouterService {
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
        return this.http.get<any>(`${this.url}/device/routers/batch/${id}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on getting all routers by Batch ID.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getById(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/device/routers/${id}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on getting router by ID.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getRouterBrands(): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/router-brands`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on getting router brands.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getNetworkSpeed(): Observable<any> {
        return this.http.get<any>(`${this.url}/router-network-speeds`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on getting network speed.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getNumberOfAntennas(): Observable<any> {
        return this.http.get<any>(`${this.url}/router-antennas`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on getting number of antennas.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getAllDevice(isCondemned: boolean): Observable<any> {
        return this.http.get<any>(`${this.url}/device/routers?isCondemned=${isCondemned}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on getting all routers.';
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
    postRouterBrandInput(brand: any): Observable<any> {
        return this.http.post<any>(`${this.url}/specs/router-brands?brand=${brand}`, null, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on posting router brand.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    postNetworkSpeedInput(speed: number): Observable<any> {
        return this.http.post<any>(`${this.url}/router-network-speeds?speedName=${speed}`, null, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on posting network speed.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    postNumberOfAntennas(antennas: number): Observable<any> {
        return this.http.post<any>(`${this.url}/router-antennas?antennaNumber=${antennas}`, null, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on posting number of antennas.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    postDevice(form: any): Observable<any> {
        return this.http.post<any>(`${this.url}/device/routers/save-all`, form, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on posting router.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //PUT
    updateDevice(form: any, id: any): Observable<any> {
        return this.http.put<any>(`${this.url}/device/routers/${id}`, form, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on updating router.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //PATCH (condemn unit)
    condemnDevice(data: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/routers/${data.id}?reason=${data.reason}&condemnedAt=${data.condemnedAt}`, null, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error in condemning device.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //DELETE
    deleteById(id: any): Observable<any> {
        return this.http.delete<any>(`${this.url}/device/routers/${id}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error in deleting router.';
            return throwError(() => new Error(errorMessage));
        }));
    }
}
