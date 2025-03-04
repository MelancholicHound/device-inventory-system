import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, first } from 'rxjs';

import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class DeviceServerService {
    private url = 'http://192.168.1.87:8082/api/v1/dis';
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
        return this.http.get<any>(`${this.url}/device/servers/batch/${id}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on getting all server by batch ID.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getById(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/device/servers/${id}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on getting server by ID.';
            return throwError(() => new Error(errorMessage));
        }))
    }

    getAllDevice(isCondemned: boolean): Observable<any> {
        return this.http.get<any>(`${this.url}/device/servers?isCondemned=${isCondemned}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on getting all servers.';
            return throwError(() => new Error(errorMessage));
        }))
    }

    getAllActiveDevice(): Observable<any> {
        return this.getAllDevice(false);
    }

    getAllCondemnedDevice(): Observable<any> {
        return this.getAllDevice(true);
    }

    //POST
    postDevice(form: any): Observable<any> {
        return this.http.post<any>(`${this.url}/device/servers/save-all`, form, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on posting server.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //PUT
    updateDevice(form: any, id: any): Observable<any> {
        return this.http.put<any>(`${this.url}/device/servers/${id}`, form, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on updating server.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //PATCH (condemn unit)
    condemnDevice(data: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/device/servers/${data.id}?reason=${data.reason}&condemnedAt=${data.condemnedAt}`, null, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on condemning server.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //DELETE
    deleteById(id: any): Observable<any> {
        return this.http.delete<any>(`${this.url}/device/servers/${id}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error on deleting server.';
            return throwError(() => new Error(errorMessage));
        }));
    }
}
