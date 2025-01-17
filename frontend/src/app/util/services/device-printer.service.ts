import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, first } from 'rxjs/operators';

import { ErrorHandlerService } from './error-handler.service';

@Injectable({
    providedIn: 'root'
})
export class DevicePrinterService {
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
        return this.http.get<any>(`${this.url}/device/printers/batch/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`device/printers/batch`)));
    }

    getById(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/device/printers/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/printers')));
    }

    getPrinterBrands(): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/printer-brands`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/printer-brands')));
    }

    getPrinterTypes(): Observable<any> {
        return this.http.get<any>(`${this.url}/printer-types`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('printer-types')));
    }

    getAllDevice(isCondemned: boolean): Observable<any> {
        return this.http.get<any>(`${this.url}/device/printers?isCondemned=${isCondemned}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/printers')));
    }

    getAllActiveDevice(): Observable<any> {
        return this.getAllDevice(false);
    }

    getAllCondemnedDevice(): Observable<any> {
        return this.getAllDevice(true);
    }

    //POST
    postPrinterBrand(brand: string): Observable<any> {
        return this.http.post<any>(`${this.url}/specs/printer-brands?brand=${brand}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/printer-brands')));
    }

    postDevice(form: any): Observable<any> {
        return this.http.post<any>(`${this.url}/device/printers/save-all`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/printers/save-all')));
    }

    searchFilter(form: any, isCondemned: boolean): Observable<any> {
        return this.http.post<any>(`${this.url}/device/printers/search?isCondemned=${isCondemned}`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/printers/search')));
    }

    //PUT
    updateDevice(form: any, id: any): Observable<any> {
        return this.http.put<any>(`${this.url}/device/printers/${id}`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/printers')));
    }

    //PATCH (condemn unit)
    condemnDevice(data: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/printers/${data.id}?reason=${data.reason}&condemnedAt=${data.condemnedAt}`, null, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/printers')));
    }

    //DELETE
    deleteById(id: any): Observable<any> {
        return this.http.delete<any>(`${this.url}/device/printers/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/printers')));
    }
}
