import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

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
        return this.http.get<any>(`${this.url}/all-in-ones/batch/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`all-in-ones/batch/${id}`)));
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

    saveDevice(form: any): Observable<any> {
        return this.http.post<any>(`${this.url}/device/all-in-ones`, this.httpOptions)
    }
}
