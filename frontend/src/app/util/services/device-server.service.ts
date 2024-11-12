import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, first } from 'rxjs';

import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class DeviceServerService {
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
        return this.http.get<any>(`${this.url}/servers/batch/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`servers/batch/${id}`)));
    }

    //POST
    postDevice(form: any): Observable<any> {
        return this.http.post<any>(`${this.url}/device/server`, form, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/server')));
    }
}
