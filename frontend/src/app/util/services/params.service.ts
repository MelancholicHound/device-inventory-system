import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, BehaviorSubject, timer } from 'rxjs';
import { catchError, first, switchMap } from 'rxjs/operators';

import { ErrorHandlerService } from './error-handler.service';

import { Supplier } from '../models/Supplier';
import { Batch } from '../models/Batch';

@Injectable({
    providedIn: 'root'
})

export class ParamsService {
    private url = 'http://192.168.1.86:8082/api/v1/dis';
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
        .pipe(first(), catchError(this.errorHandler.handleError<any>('divisions')));
    }

    getDivisionById(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/divisions/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('divisions')));
    }

    getSectionsByDivisionId(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/divisions/${id}/sections`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`divisions/${id}/sections`)));
    }

    getSectionById(divId: any,secId: any): Observable<any> {
        return this.http.get<any>(`${this.url}/divisions/${divId}/sections/${secId}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('divisions')));
    }

    getOS(): Observable<any> {
        return this.http.get<any>(`${this.url}/software/operating-systems`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('software/operating-systems')));
    }

    getProdTools(): Observable<any> {
        return this.http.get<any>(`${this.url}/software/productivity-tools`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('software/productivity-tools')));
    }

    getSecurity(): Observable<any> {
        return this.http.get<any>(`${this.url}/software/securities`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('software/securities')));
    }

    getConnections(): Observable<any> {
        return this.http.get<any>(`${this.url}/connections`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('connections')));
    }

    getPeripherals(): Observable<any> {
        return this.http.get<any>(`${this.url}/peripherals`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('peripherals')))
    }

    getSuppliers(): Observable<any[]> {
        return this.http.get<any>(`${this.url}/suppliers`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('suppliers')));
    }

    getSupplierById(id: number): Observable<any> {
        return this.http.get<any>(`${this.url}/suppliers/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`suppliers/${id}`)));
    }

    getAllBatches(): Observable<any> {
        return this.http.get<any>(`${this.url}/batches`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('batches')));
    }

    getBatchDetails(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/batches/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`batches/${id}`)));
    }

    //POST
    postSupplier(supplier: Omit<Supplier, 'id'>): Observable<Supplier> {
        return this.http.post<Supplier>(`${this.url}/suppliers`, supplier, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<Supplier>('suppliers')));
    }

    postBatch(batch: Omit<Batch, 'id'>): Observable<Batch> {
        return this.http.post<Batch>(`${this.url}/batches`, batch, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<Batch>('batches')));
    }

    //DELETE
    deleteBatch(id: any): Observable<any> {
        return this.http.delete<any>(`${this.url}/batches/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`batches/${id}`)));
    }
}
