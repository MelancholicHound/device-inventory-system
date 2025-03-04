import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, BehaviorSubject, timer, throwError } from 'rxjs';
import { catchError, first, switchMap } from 'rxjs/operators';

import { ErrorHandlerService } from './error-handler.service';

import { Supplier } from '../models/Supplier';
import { Batch } from '../models/Batch';

@Injectable({
    providedIn: 'root'
})

export class ParamsService {
    private url = 'http://192.168.1.87:8082/api/v1/dis';
    private token = localStorage.getItem('token');

    httpOptions: { headers: HttpHeaders } = {
        headers: new HttpHeaders({
            'Content-Type' : 'application/json' ,
            'Authorization' : `Bearer ${this.token}`
        })
    }

    constructor(private http: HttpClient,
                private errorHandler: ErrorHandlerService) { }

    //GET
    getAllDivisions(): Observable<any> {
        return this.http.get<any>(`${this.url}/divisions`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get divisions value.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getDivisionById(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/divisions/${id}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get division by its id.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getSectionsByDivisionId(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/divisions/${id}/sections`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get sections by division id.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getSectionById(divId: any,secId: any): Observable<any> {
        return this.http.get<any>(`${this.url}/divisions/${divId}/sections/${secId}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get section by id.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getOS(): Observable<any> {
        return this.http.get<any>(`${this.url}/software/operating-systems`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get OS values.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getProdTools(): Observable<any> {
        return this.http.get<any>(`${this.url}/software/productivity-tools`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get productivity tool values.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getSecurity(): Observable<any> {
        return this.http.get<any>(`${this.url}/software/securities`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get security values.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getConnections(): Observable<any> {
        return this.http.get<any>(`${this.url}/connections`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get connection values.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getPeripherals(): Observable<any> {
        return this.http.get<any>(`${this.url}/peripherals`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get peripheral values.';
            return throwError(() => new Error(errorMessage));
        }))
    }

    getSuppliers(): Observable<any> {
        return this.http.get<any>(`${this.url}/suppliers`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get suppliers.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getSupplierById(id: number): Observable<any> {
        return this.http.get<any>(`${this.url}/suppliers/${id}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get suppliers by id.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getAllBatches(): Observable<any> {
        return this.http.get<any>(`${this.url}/batches`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get all batches.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getBatchDetails(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/batches/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`batches/${id}`)));
    }

    //POST
    postSupplier(supplier: Omit<Supplier, 'id'>): Observable<Supplier> {
        return this.http.post<Supplier>(`${this.url}/suppliers`, supplier, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An uknown error occured.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    postBatch(batch: Omit<Batch, 'id'>): Observable<Batch> {
        return this.http.post<Batch>(`${this.url}/batches`, batch, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An uknown error occured.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    postUPS(form: any): Observable<any> {
        return this.http.post<any>(`${this.url}/device/ups`, form, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An unknown error occured';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //DELETE
    deleteBatch(id: any): Observable<any> {
        return this.http.delete<any>(`${this.url}/batches/${id}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not delete batch. Please try again.';
            return throwError(() => new Error(errorMessage));
        }));
    }
}
