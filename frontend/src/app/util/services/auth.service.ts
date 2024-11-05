import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, first } from 'rxjs/operators';

import { ErrorHandlerService } from './error-handler.service';

import { User } from '../models/User';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private url = 'http://192.168.250.147:8082/api/v1/dis';

    private isUserLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    deviceDetails: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    userLogged$: Observable<boolean> = this.isUserLoggedIn.asObservable();

    httpOptions: { headers: HttpHeaders } = {
        headers: new HttpHeaders({ 'Content-Type' : 'application/json' })
    }

    constructor(private http: HttpClient,
                private errorHandler: ErrorHandlerService) { }

    signup(user: Omit<User, 'id'>): Observable<User> {
        return this.http.post<User>(`${this.url}/register`, user, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('register')));
    }

    login(email: Pick<User, 'email'>, password: Pick<User, 'password'>): Observable<any> {
        return this.http.post(`${this.url}/login`, { email, password }, { responseType: 'text' })
        .pipe(first(), tap((token: any) => {
            localStorage.setItem('token', token);
            this.isUserLoggedIn.next(true);
        }), catchError((error) => {
            if (error.status === 400 && error.error && error.error.message) {
                this.errorHandler.handleError('Login failed: ', error.error.message);
            }
            return throwError(error);
        }));
    }

    getEmployeePositions(): Observable<any> {
        return this.http.get<any>(`${this.url}/positions`)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('positions')));
    }

    dataStore(form: any) {
        this.deviceDetails.next(form);
    }
}
