import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { catchError, first } from 'rxjs/operators';

import { ErrorHandlerService } from './error-handler.service';

@Injectable({
    providedIn: 'root'
})

export class ParamsService {
    private url = 'http://192.168.1.87:8082/api/v1/dis';

    httpOptions: { headers: HttpHeaders} = {
        headers: new HttpHeaders({ 'Content-Type' : 'application/json' })
    }

    constructor(private http: HttpClient,
                private errorHandler: ErrorHandlerService) { }

    getAllDivisions(): Observable<any> {
        return this.http.get<any>(`${this.url}/divisions`)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('divisions')));
    }

    getSectionsById(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/divisions/${id}/sections`)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`divisions/${id}/sections`)));
    }

    getUPSBrand(): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/ups-brands`)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/ups-brands')));
    }

    getOS(): Observable<any> {
        return this.http.get<any>(`${this.url}/software/operating-systems`)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('software/operating-systems')));
    }

    getProdTools(): Observable<any> {
        return this.http.get<any>(`${this.url}/software/productivity-tools`)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('software/productivity-tools')));
    }

    getSecurity(): Observable<any> {
        return this.http.get<any>(`${this.url}/software/securities`)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('software/securities')));
    }

    getConnections(): Observable<any> {
        return this.http.get<any>(`${this.url}/connections`)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('connections')));
    }

    getAllProcBrand(): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/cpu-brands`)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/cpu-brands')));
    }

    getProcSeriesById(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/cpu-brands/${id}/series`)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`specs/cpu-brands/${id}/series`)));
    }

    getRamCapacities(): Observable<any> {
        return this.http.get<any>(`${this.url}/part/ram-capacities`)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('part/ram-capacities')));
    }

    getStorageCapacities(): Observable<any> {
        return this.http.get<any>(`${this.url}/part/storage-capacities`)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('part/storage-capacities')));
    }

    getVideoCardCapacities(): Observable<any> {
        return this.http.get<any>(`${this.url}/part/video-card-capacities`)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('part/video-card-capacities')));
    }
}
