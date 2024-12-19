import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
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
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`device/routers/batch`)));
    }

    getById(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/device/routers/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/routers')));
    }

    getRouterBrands(): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/router-brands`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/router-brands')));
    }

    getNetworkSpeed(): Observable<any> {
        return this.http.get<any>(`${this.url}/router-network-speeds`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('router-network-speeds')));
    }

    getNumberOfAntennas(): Observable<any> {
        return this.http.get<any>(`${this.url}/router-antennas`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('router-antennas')));
    }

    getAllDevice(isCondemned: boolean): Observable<any> {
        return this.http.get<any>(`${this.url}/device/routers?isCondemned=${isCondemned}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/routers')));
    }

    getAllActiveDevice(): Observable<any> {
        return this.getAllDevice(false);
    }

    getAllCondemnedDevice(): Observable<any> {
        return this.getAllDevice(true);
    }

    //POST
    postRouterBrandInput(brand: any): Observable<any> {
        return this.http.post<any>(`${this.url}/specs/router-brands?brand=${brand}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/router-brands')))
    }

    postNetworkSpeedInput(speed: number): Observable<any> {
        return this.http.post<any>(`${this.url}/router-network-speeds?speedName=${speed}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('router-network-speeds')));
    }

    postNumberOfAntennas(antennas: number): Observable<any> {
        return this.http.post<any>(`${this.url}/router-antennas?antennaNumber=${antennas}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('router-antennas')));
    }

    postDevice(form: any): Observable<any> {
        return this.http.post<any>(`${this.url}/device/routers/save-all`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/routers/save-all')));
    }

    //PUT
    updateDevice(form: any, id: any): Observable<any> {
        return this.http.put<any>(`${this.url}/device/routers/${id}`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/routers')));
    }

    //PATCH (condemn unit)
    condemnDevice(data: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/routers/${data.id}?reason=${data.reason}&condemnedAt=${data.condemnedAt}`, null, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/routers')));
    }

    //DELETE
    deleteById(id: any): Observable<any> {
        return this.http.delete<any>(`${this.url}/device/routers/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/routers')));
    }
}
