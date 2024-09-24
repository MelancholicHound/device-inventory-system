import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, first } from 'rxjs/operators';

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
        headers: new HttpHeaders({ 'Content-Type' : 'application/json' , 'Authorization' : `Bearer ${this.token}` })
    }

    constructor(private http: HttpClient,
                private errorHandler: ErrorHandlerService) { }

    getAllDivisions(): Observable<any> {
        return this.http.get<any>(`${this.url}/divisions`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('divisions')));
    }

    getSectionsById(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/divisions/${id}/sections`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`divisions/${id}/sections`)));
    }

    getUPSBrand(): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/ups-brands`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/ups-brands')));
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

    getAllProcBrand(): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/cpu-brands`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/cpu-brands')));
    }

    getProcSeriesById(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/cpu-brands/${id}/series`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`specs/cpu-brands/${id}/series`)));
    }

    getRamCapacities(): Observable<any> {
        return this.http.get<any>(`${this.url}/part/ram-capacities`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('part/ram-capacities')));
    }

    getStorageCapacities(): Observable<any> {
        return this.http.get<any>(`${this.url}/part/storage-capacities`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('part/storage-capacities')));
    }

    getVideoCardCapacities(): Observable<any> {
        return this.http.get<any>(`${this.url}/part/video-card-capacities`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('part/video-card-capacities')));
    }

    getSuppliers(): Observable<any> {
        return this.http.get<any>(`${this.url}/suppliers`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('suppliers')));
    }

    saveSupplier(supplier: Omit<Supplier, 'supplierId'>): Observable<Supplier> {
        return this.http.post<Supplier>(`${this.url}/suppliers`, supplier, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<Supplier>('suppliers')));
    }

    saveBatch(batch: Omit<Batch, 'batchId'>): Observable<Batch> {
        return this.http.post<Batch>(`${this.url}/batches`, batch, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<Batch>('batches')));
    }
}
