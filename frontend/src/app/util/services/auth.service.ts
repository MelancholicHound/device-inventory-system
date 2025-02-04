import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, first } from 'rxjs/operators';

import { ErrorHandlerService } from './error-handler.service';

import { User } from '../models/User';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private url = 'http://192.168.1.86:8082/api/v1/dis';

    private isUserLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    deviceDetails: BehaviorSubject<any> = new BehaviorSubject<any>([]);

    httpOptions: { headers: HttpHeaders } = {
        headers: new HttpHeaders({ 'Content-Type' : 'application/json' })
    }

    constructor(private http: HttpClient,
                private errorHandler: ErrorHandlerService) { }

    signup(user: Omit<User, 'id'>): Observable<User> {
        return this.http.post<User>(`${this.url}/register`, user, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An unknown error occured.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    login(email: Pick<User, 'email'>, password: Pick<User, 'password'>): Observable<any> {
        return this.http.post(`${this.url}/login`, { email, password }, { responseType: 'text' })
        .pipe(first(), tap((token: any) => {
            localStorage.setItem('token', token);
            this.isUserLoggedIn.next(true);
        }), catchError((error) => {
            const errorMessage = error?.error?.message || 'Wrong email or password. Please try again.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    getEmployeePositions(): Observable<any> {
        return this.http.get<any>(`${this.url}/positions`)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Could not get employee positions.';
            return throwError(() => new Error(errorMessage));
        }));
    }

    dataStore(form: any) {
        this.deviceDetails.next(form);
    }
}
