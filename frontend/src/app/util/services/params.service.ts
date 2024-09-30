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

    private supplierSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

    httpOptions: { headers: HttpHeaders } = {
        headers: new HttpHeaders({ 'Content-Type' : 'application/json' , 'Authorization' : `Bearer ${this.token}` })
    }

    constructor(private http: HttpClient,
                private errorHandler: ErrorHandlerService) {
                this.startPolling();
    }

    private fetchSuppliers(): Observable<any[]> {
      return this.http.get<any>(`${this.url}/suppliers`, this.httpOptions)
      .pipe(first(), catchError(this.errorHandler.handleError<any>('suppliers')));
    }

    private startPolling() {
        timer(0, 1000)
        .pipe(switchMap(() => this.fetchSuppliers()))
        .subscribe({
            next: (suppliers: any[]) => {
                this.supplierSubject.next(suppliers);
            },
            error: (error: any) => {
                console.log(error);
            }
        });
    }

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

    getSuppliers(): Observable<any[]> {
        return this.supplierSubject.asObservable();
    }

    getSupplierById(id: number): Observable<any> {
        return this.http.get<any>(`${this.url}/suppliers/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`suppliers/${id}`)));
    }

    saveSupplier(supplier: Omit<Supplier, 'id'>): Observable<Supplier> {
        return this.http.post<Supplier>(`${this.url}/suppliers`, supplier, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<Supplier>('suppliers')));
    }

    saveBatch(batch: Omit<Batch, 'id'>): Observable<Batch> {
        return this.http.post<Batch>(`${this.url}/batches`, batch, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<Batch>('batches')));
    }

    getAllBatches(): Observable<any> {
        return this.http.get<any>(`${this.url}/batches`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('batches')));
    }

    getBatchDetails(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/batches/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`batches/${id}`)));
    }

    deleteBatch(id: any): Observable<any> {
        return this.http.delete<any>(`${this.url}/batches/${id}`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`batches/${id}`)));
    }
}
