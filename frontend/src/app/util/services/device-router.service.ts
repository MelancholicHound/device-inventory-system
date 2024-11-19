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
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`routers/batch/${id}`)))
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

    getAllDevice(): Observable<any> {
        return this.http.get<any>(`${this.url}/device/routers`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/routers')));
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
        return this.http.post<any>(`${this.url}/device/routers`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/routers')));
    }
}
