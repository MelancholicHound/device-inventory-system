import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, first } from 'rxjs';

import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class DeviceTabletService {
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
        return this.http.get<any>(`${this.url}/device/tablets/batch/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`device/tablets/batch`)));
    }

    getById(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/device/tablets/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/tablets')));
    }

    getTabletBrands(): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/tablet-brands`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/tablet-brands')));
    }

    getChipsetBrands(): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/chipset-brands`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/chipset-brands')));
    }

    getAllDevice(): Observable<any> {
        return this.http.get<any>(`${this.url}/device/tablets`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/tablets')));
    }

    //POST
    postTabletBrand(brand: string): Observable<any> {
        return this.http.post<any>(`${this.url}/specs/tablet-brands?brand=${brand}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/tablet-brands')));
    }

    postChipsetBrand(brand: string): Observable<any> {
        return this.http.post<any>(`${this.url}/specs/chipset-brands?brand=${brand}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/chipset-brands')));
    }

    postDevice(form: any): Observable<any> {
        return this.http.post<any>(`${this.url}/device/tablets/save-all`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/tablets/save-all')));
    }

    //PUT
    updateDevice(form: any, id: any): Observable<any> {
        return this.http.put<any>(`${this.url}/device/tablets/${id}`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/tablets')));
    }

    //DELETE
    deleteById(id: any): Observable<any> {
        return this.http.delete<any>(`${this.url}/device/tablets/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/tablets')));
    }
}
