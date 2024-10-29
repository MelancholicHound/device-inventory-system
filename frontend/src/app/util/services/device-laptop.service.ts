import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, first } from 'rxjs/operators';

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
        return this.http.get<any>(`${this.url}/laptops/batch/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`laptops/batch/${id}`)))
    }

    getLaptopBrands(): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/laptop-brands`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/laptop-brands')));
    }

    //POST
    postLaptopBrand(brand: string): Observable<any> {
        return this.http.post<any>(`${this.url}/specs/laptop-brands`, this.httpOptions) //configure url (for params)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/laptop-brands')));
    }
}
