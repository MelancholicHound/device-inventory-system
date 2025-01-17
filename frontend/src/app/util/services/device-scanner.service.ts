import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, first } from 'rxjs/operators';

import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class DeviceScannerService {
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
        return this.http.get<any>(`${this.url}/device/scanners/batch/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`device/scanners/batch`)));
    }

    getById(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/device/scanners/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/scanners')));
    }

    getScannerBrands(): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/scanner-brands`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/scanner-brands')));
    }

    getScannerType(): Observable<any> {
        return this.http.get<any>(`${this.url}/scanner-types`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('scanner-types')));
    }

    getAllDevice(isCondemned: boolean): Observable<any> {
        return this.http.get<any>(`${this.url}/device/scanners?isCondemned=${isCondemned}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/scanners')));
    }

    getAllActiveDevice(): Observable<any> {
        return this.getAllDevice(false);
    }

    getAllCondemnedDevice(): Observable<any> {
        return this.getAllDevice(true);
    }

    //POST
    postScannerBrand(brand: any): Observable<any> {
        return this.http.post<any>(`${this.url}/specs/scanner-brands?brand=${brand}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/scanner-brands')));
    }

    postDevice(form: any): Observable<any> {
        return this.http.post<any>(`${this.url}/device/scanners/save-all`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/scanners/save-all')));
    }

    searchFilter(form: any, isCondemned: boolean): Observable<any> {
        return this.http.post<any>(`${this.url}/device/scanners/search?isCondemned=${isCondemned}`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/scanners/search')));
    }

    //PUT
    updateDevice(form: any, id: any): Observable<any> {
        return this.http.put<any>(`${this.url}/device/scanners/${id}`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/scanners')));
    }

    //PATCH (condemn unit)
    condemnDevice(data: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/scanners/${data.id}?reason=${data.reason}&condemnedAt=${data.condemnedAt}`, null, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/scanners')));
    }

    //DELETE
    deleteById(id: any): Observable<any> {
        return this.http.delete<any>(`${this.url}/device/scanners/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/scanners')));
    }
}
