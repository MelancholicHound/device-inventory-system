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
        return this.http.get<any>(`${this.url}/device/laptops/batch/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`device/laptops/batch`)));
    }

    getById(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/device/laptops/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/laptops')));
    }

    getAllDevice(isCondemned: boolean): Observable<any> {
        return this.http.get<any>(`${this.url}/device/laptops?isCondemned=${isCondemned}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/laptops')));
    }

    getAllActiveDevice(): Observable<any> {
        return this.getAllDevice(false);
    }

    getAllCondemnedDevice(): Observable<any> {
        return this.getAllDevice(true);
    }

    getLaptopBrands(): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/laptop-brands`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/laptop-brands')));
    }

    //POST
    postLaptopBrand(brand: string): Observable<any> {
        return this.http.post<any>(`${this.url}/specs/laptop-brands?brand=${brand}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/laptop-brands')));
    }

    postDevice(form: any): Observable<any> {
        return this.http.post<any>(`${this.url}/device/laptops/save-all`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/laptops/save-all')));
    }

    //PUT
    updateDevice(form: any, id: any): Observable<any> {
        return this.http.put<any>(`${this.url}/device/laptops/${id}`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/laptops')));
    }

    //PATCH (condemn unit)
    condemnDevice(data: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/laptops/${data.id}?reason=${data.reason}&condemnedAt=${data.condemnedAt}`, null, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/laptops')));
    }

    //DELETE
    deleteById(id: any): Observable<any> {
        return this.http.delete<any>(`${this.url}/device/laptops/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/laptops')));
    }
}
