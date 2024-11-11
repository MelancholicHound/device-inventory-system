import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, first } from 'rxjs/operators';

import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class SpecsService {
    private url = 'http://192.168.250.170:8082/api/v1/dis';
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

    getAllProcBrands(): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/cpu-brands`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('specs/cpu-brands')));
    }

    getProcSeriesById(id: any): Observable<any> {
        return this.http.get<any>(`${this.url}/specs/cpu-brands/${id}/series`, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>(`specs/cpu-brands/${id}/series`)));
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
        return this.http.post<any>(`${this.url}/specs/cpu-brands?brand=${brand}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            if (error === 400 && error.error && error.error.message) {
                this.errorHandler.handleError('Error on posting processor brand: ', error.error.message);
            }
            return new Observable((observer) => { observer.error(error) });
        }));
    }

    postProcSeries(id: any, series: any): Observable<any> {
        return this.http.post<any>(`${this.url}/specs/cpu-brands/${id}/series?series=${series}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            if (error.status === 400 && error.error && error.error.message) {
                this.errorHandler.handleError('Error on posting processor series: ', error.error.message);
            }
            return new Observable((observer) => { observer.error(error) });
        }));
    }

    postRAMCapacity(capacity: any): Observable<any> {
        return this.http.post<any>(`${this.url}/part/ram-capacities?capacity=${capacity}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            if (error === 400 && error.error && error.error.message) {
                this.errorHandler.handleError('Error on posting RAM capacity: ', error.error.message);
            }
            return new Observable((observer) => { observer.error(error) });
        }));
    }

    postGPUCapacity(capacity: any): Observable<any> {
        return this.http.post<any>(`${this.url}/part/video-card-capacities?capacity=${capacity}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            if (error === 400 && error.error && error.error.message) {
                this.errorHandler.handleError('Error on posting video card capacity: ', error.error.message);
            }
            return new Observable((observer) => { observer.error(error) });
        }));
    }

    postStorageCapacity(capacity: any): Observable<any> {
        return this.http.post<any>(`${this.url}/part/storage-capacities?capacity=${capacity}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            if (error === 400 && error.error && error.error.message) {
                this.errorHandler.handleError('Error on posting storage capacity: ', error.error.message);
            }
            return new Observable((observer) => { observer.error(error) });
        }));
    }

    //DELETE

}
