import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, first } from 'rxjs/operators';

import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class DeviceScannerService {
    private url = 'http://192.168.250.147:8082/api/v1/dis';
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
        return this.http.get<any>(`${this.url}/scanners/batch/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`scanners/batch/${id}`)));
    }

    getScannerBrands(): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/scanner-brands`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/scanner-brands')));
    }

    //GET request of scanner type
}
