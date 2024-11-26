import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
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

    getAllDevice(): Observable<any> {
        return this.http.get<any>(`${this.url}/device/all-in-ones`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/all-in-ones')));
    }

    getAIOBrands(): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/aio-brands`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/aio-brands')));
    }

    //POST
    postAIOBrand(brand: string): Observable<any> {
        return this.http.post<any>(`${this.url}/specs/aio/aio-brands?brand=${brand}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`specs/aio/aio-brands?brand=${brand}`)));
    }

    postDevice(form: any): Observable<any> {
        return this.http.post<any>(`${this.url}/device/all-in-ones/save-all`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/all-in-ones/save-all')));
    }

    //PUT
    updateDevice(form: any, id: any): Observable<any> {
        return this.http.put<any>(`${this.url}/device/all-in-ones/${id}`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/all-in-ones')));
    }

    //DELETE
    deleteById(id: any): Observable<any> {
        return this.http.delete<any>(`${this.url}/device/all-in-ones/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/all-in-ones')));
    }
}
