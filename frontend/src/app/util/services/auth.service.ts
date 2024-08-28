import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { catchError, tap, first } from 'rxjs/operators';

import { ErrorHandlerService } from './error-handler.service';

import { User } from '../models/User';

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    private url = 'http://192.168.1.87:8082/api/v1/dis';
    private reserveUrl = 'http://192.168.1.86:3000/auth';

    httpOptions: { headers: HttpHeaders } = {
        headers: new HttpHeaders({ 'Content-Type' : 'application/json' })
    }

    constructor(private http: HttpClient,
                private errorHandler: ErrorHandlerService,
                private router: Router) { }

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

    getEmployeePositions(): Observable<any> {
        return this.http.get<any>(`${this.url}/positions`)
        .pipe(first(), catchError(this.errorHandler.handleError<any>('positions')));
    }
}
