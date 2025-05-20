import { computed, Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, throwError } from 'rxjs';
import { first, catchError, tap } from 'rxjs/operators';

import { User } from '../models/User';
import { Positions } from '../models/Positions';

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    private url = 'http://192.168.1.87:8082/api/v1/dis';
    private _token = signal<string | null>(localStorage.getItem('token'));

    router = inject(Router);

    httpOptions: { headers: HttpHeaders } = {
        headers: new HttpHeaders({ 'Content-Type' : 'application/json' })
    }

    constructor(private http: HttpClient) {
        window.addEventListener('storage', (event) => {
            if (event.key === 'token') {
                this._token.set(localStorage.getItem('token'));
            }
        });
    }

    //GET Requests
    getByEmail(email: string | any): Observable<User> {
        return this.http.get<User>(`${this.url}/employees/email/${email}`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || "An account with this email doesn't exists.";

            return throwError(() => errorMessage);
        }));
    }

    getEmployeePositions(): Observable<Positions[]> {
        return this.http.get<Positions[]>(`${this.url}/positions`, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || "Error occured in getting employee positions.";

            return throwError(() => errorMessage);
        }));
    }

    //POST Requests
    signup(user: Omit<User, 'id'>): Observable<User> {
        return this.http.post<User>(`${this.url}/register`, user, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An unknown error occured during signup.';

            return throwError(() => errorMessage);
        }))
    }

    login(email: Pick<User, 'email'>, password: Pick<User, 'password'>): Observable<any> {
        return this.http.post(`${this.url}/login`, { email, password }, { responseType: 'text' })
        .pipe(first(), tap((token: any) => this.setToken(token)), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'Wrong email or password. Please try again.';

            return throwError(() => errorMessage);
        }));
    }

    changePassword(email: any, password: any): Observable<any> {
        return this.http.post<any>(`${this.url}/employees/forgot-password?email=${email}&newPassword=${password}&reTypeNewPassword=${password}`, null, this.httpOptions)
        .pipe(first(), catchError((error: any) => {
            const errorMessage = error?.error?.message || 'An error occured during changing of account password.';

            return throwError(() => errorMessage);
        }));
    }

    //Functions
    setToken(token: string): void {
        localStorage.setItem('token', token);
        this._token.set(token);
    }

    removeToken(): void {
        localStorage.removeItem('token');
        this._token.set(null);
        this.router.navigateByUrl('/');
    }

    isLoggedIn = computed(() => !!this._token());
}
