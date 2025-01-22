import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, first } from 'rxjs/operators';

import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class SpecsService {
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
    getUPSBrand(): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/ups-brands`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/ups-brands')));
    }

    getAllUPS(): Observable<any> {
        return this.http.get<any>(`${this.url}/device/ups?isCondemned=false`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('device/ups')));
    }

    getAllProcBrands(): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/cpu-brands`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/cpu-brands')));
    }

    getProcSeriesById(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/cpu-brands/${id}/series`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`specs/cpu-brands/${id}/series`)));
    }

    getAllMoboBrands(): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/motherboard-brands`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/motherboard-brands')));
    }

    getRAMCapacities(): Observable<any> {
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

    //POST
    postProcBrand(brand: any): Observable<any> {
        return this.http.post<any>(`${this.url}/specs/cpu-brands?brand=${brand}`, null, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An unknown error occured';
            return throwError(() => new Error(errorMessage));
        }));
    }

    postProcSeries(id: any, series: any): Observable<any> {
        return this.http.post<any>(`${this.url}/specs/cpu-brands/${id}/series?series=${series}`, null, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An unknown error occured';
            return throwError(() => new Error(errorMessage));
        }));
    }

    postRAMCapacity(capacity: any): Observable<any> {
        return this.http.post<any>(`${this.url}/part/ram-capacities?capacity=${capacity}`, null,  this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An unknown error occured';
            return throwError(() => new Error(errorMessage));
        }));
    }

    postGPUCapacity(capacity: any): Observable<any> {
        return this.http.post<any>(`${this.url}/part/video-card-capacities?capacity=${capacity}`, null, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An unknown error occured';
            return throwError(() => new Error(errorMessage));
        }));
    }

    postStorageCapacity(capacity: any): Observable<any> {
        return this.http.post<any>(`${this.url}/part/storage-capacities?capacity=${capacity}`, null, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An unknown error occured';
            return throwError(() => new Error(errorMessage));
        }));
    }

    //DELETE

}
