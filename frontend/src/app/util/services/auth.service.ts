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
    private reserveUrl = 'http://192.168.250.118:4100/auth';

    private isUserLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    deviceDetails: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    userLogged$: Observable<boolean> = this.isUserLoggedIn.asObservable();

    httpOptions: { headers: HttpHeaders } = {
        headers: new HttpHeaders({ 'Content-Type' : 'application/json' })
    }

    constructor(private http: HttpClient,
                private errorHandler: ErrorHandlerService) { }

    signup(user: Omit<User, 'id'>): Observable<User> {
        return this.http.post<User>(`${this.reserveUrl}/signup`, user, this.httpOptions)
        .pipe(first(), catchError(this.errorHandler.handleError<User>('signup')));
    }

    verifyOTP(otp: any): Observable<any> {
        return this.http.post<any>(`${this.reserveUrl}/signup/otp`, { otp }, this.httpOptions)
        .pipe(first(), catchError((error) => {
              if (error.status === 400 && error.error) {
                  this.errorHandler.handleError('Authentication failed: ', error.error.message);
              } return error; }));
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
