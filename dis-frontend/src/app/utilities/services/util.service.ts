import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { first, catchError, tap } from 'rxjs/operators';

import { Supplier } from '../models/Supplier';
import { Batch } from '../models/Batch';
import { PeripheralUPS } from '../models/PeripheralUPS';

@Injectable({
    providedIn: 'root'
})
export class UtilService {
    private url = 'http://192.168.5.5:8082/api/v1/dis';
    private _token = signal<string | null>(localStorage.getItem('token'));


    httpOptions: { headers: HttpHeaders } = {
        headers: new HttpHeaders({
            'Content-Type' : 'application/json',
            'Authorization' : `Bearer ${this._token()}`
        })
    }

    constructor(private http: HttpClient) {
        window.addEventListener('storage', (event) => {
            if (event.key === 'token') {
                this._token.set(localStorage.getItem('token'));
            }
        });
    }

    //GET Requests
    getDivisions(): Observable<any[]> {
        return this.http.get<any[]>(`${this.url}/divisions`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could no get division values.';

            return throwError(() => errorMessage);
        }));
    }

    getDivisionById(id: number): Observable<any> {
        return this.http.get<any>(`${this.url}/divisions/${id}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get division by ID.';

            return throwError(() => errorMessage);
        }));
    }

    getSectionsByDivisionId(id: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.url}/divisions/${id}/sections`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get sections by division ID.';

            return throwError(() => errorMessage);
        }));
    }

    getSectionById(divId: number, secId: number): Observable<any> {
        return this.http.get<any>(`${this.url}/divisions/${divId}/sections/${secId}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get section by ID.';

            return throwError(() => errorMessage);
        }));
    }

    getOperatingSystems(): Observable<any[]> {
        return this.http.get<any[]>(`${this.url}/software/operating-systems`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get operating system values.';

            return throwError(() => errorMessage);
        }));
    }

    getProdTools(): Observable<any[]> {
        return this.http.get<any[]>(`${this.url}/software/productivity-tools`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get productivity tool values.';

            return throwError(() => errorMessage);
        }));
    }

    getSecurity(): Observable<any[]> {
        return this.http.get<any[]>(`${this.url}/softwares/securities`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get security values.';

            return throwError(() => errorMessage);
        }));
    }

    getConnections(): Observable<any[]> {
        return this.http.get<any[]>(`${this.url}/connections`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get connection values.';

            return throwError(() => errorMessage);
        }));
    }

    getPeripherals(): Observable<any[]> {
        return this.http.get<any[]>(`${this.url}/peripherals`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.message?.message || 'Could not get peripheral values.';

            return throwError(() => errorMessage);
        }));
    }

    getSuppliers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.url}/suppliers`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get supplier details.';

            return throwError(() => errorMessage);
        }));
    }

    getSupplierById(id: number): Observable<any> {
        return this.http.get<any>(`${this.url}/suppliers/${id}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get supplier by id';

            return throwError(() => errorMessage);
        }));
    }

    getBatches(): Observable<any[]> {
        return this.http.get<any[]>(`${this.url}/batches`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get batches.';

            return throwError(() => errorMessage);
        }));
    }

    getBatchById(id: number): Observable<any> {
        return this.http.get<any>(`${this.url}/batches/${id}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get batch by id';

            return throwError(() => errorMessage);
        }));
    }

    //POST Requests
    postSupplier(form: Omit<Supplier, 'id'>): Observable<Supplier> {
        return this.http.post<Supplier>(`${this.url}/suppliers`, form, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error in posting supplier details.';

            return throwError(() => errorMessage);
        }));
    }

    postBatch(form: Omit<Batch, 'id'>): Observable<Batch> {
        return this.http.post<Batch>(`${this.url}/batches`, form, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error in posting batch details.';

            return throwError(() => errorMessage);
        }));
    }

    postUPSDetails(form: Omit<PeripheralUPS, 'id'>): Observable<PeripheralUPS> {
        return this.http.post<PeripheralUPS>(`${this.url}/device/ups`, form, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error in posting UPS details.';

            return throwError(() => errorMessage);
        }));
    }

    //DELETE Requests
    deleteBatch(id: number): Observable<any> {
        return this.http.delete<any>(`${this.url}/batches/${id}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Error in deleting batch';

            return throwError(() => errorMessage);
        }));
    }
}
