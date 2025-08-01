import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, throwError } from 'rxjs';
import { first, catchError, tap } from 'rxjs/operators';

import { UserInterface } from '../models/UserInterface';
import { BatchInterface } from '../models/BatchInteface';
import { SupplierInterface } from '../models/SupplierInterface';

@Injectable({
  providedIn: 'root'
})
export class Request {
  private url = 'http://192.168.1.87:3001/app/auth';
  private _token = signal<string | null>(localStorage.getItem('token'));

  router = inject(Router);

  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type' : 'application/json' })
  }

  private httpOptionsWithToken(): { headers: HttpHeaders } {
    return { headers: new HttpHeaders({
      'Content-Type' : 'application/json',
      'Authorization' : `Bearer ${this._token()}`
    }) };
  }

  constructor(private http: HttpClient) {
    window.addEventListener('storage', (event) => {
      if (event.key === 'token') {
        this._token.set(localStorage.getItem('token'));
      }
    });
  }

  //POST Requests
  signup(user: Omit<UserInterface, 'id'>): Observable<UserInterface> {
    return this.http.post<UserInterface>(`${this.url}/signup`, user, this.httpOptions)
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during signup.';

      return throwError(() => errorMessage);
    }));
  }

  login(email: Pick<UserInterface, 'email'>, password: Pick<UserInterface, 'password'>): Observable<any> {
    return this.http.post(`${this.url}/login`, { email, password }, { responseType: 'text' })
    .pipe(first(), tap((token) => this.setToken(token)), catchError((error: any) => {
      const errorMessage = error?.error?.message || 'An unknown error occured during login.';

      return throwError(() => errorMessage);
    }));
  }

  recover(email: Pick<UserInterface, 'email'>, password: Pick<UserInterface, 'password'>): Observable<any>{
    return this.http.post(`${this.url}/user/recover`, { email, password }, this.httpOptions)
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during changing account password.';

      return throwError(() => errorMessage);
    }));
  }

  postBatch(batch: Omit<BatchInterface, 'id'>): Observable<any> {
    return this.http.post(`${this.url}/batch`, batch, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of batch.';

      return throwError(() => errorMessage);
    }));
  }

  postSupplier(supplier: Omit<SupplierInterface, 'id'>): Observable<SupplierInterface> {
    return this.http.post<SupplierInterface>(`${this.url}/supplier`, supplier, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of supplier.';

      return throwError(() => errorMessage);
    }));
  }

  //GET Requests
  getByEmail(email: string | any): Observable<UserInterface> {
    return this.http.get<UserInterface>(`${this.url}/user/recover?email=${email}`, this.httpOptions)
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of account via email.';

      return throwError(() => errorMessage);
    }));
  }

  getUser(): Observable<UserInterface> {
    return this.http.get<UserInterface>(`${this.url}/user`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of account.';

      return throwError(() => errorMessage);
    }));
  }

  getDivisions(): Observable<any> {
    return this.http.get(`${this.url}/division`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of divisions.';

      return throwError(() => errorMessage);
    }));
  }

  getDivisionById(id: number): Observable<any> {
    return this.http.get(`${this.url}/division/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of division by id.';

      return throwError(() => errorMessage);
    }));
  }

  getSectionsByDivisionId(id: number): Observable<any> {
    return this.http.get(`${this.url}/section/division/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of sections by division id.';

      return throwError(() => errorMessage);
    }));
  }

  getSectionById(id: number): Observable<any> {
    return this.http.get(`${this.url}/section/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of section by id.';

      return throwError(() => errorMessage);
    }));
  }

  getAllBatches(): Observable<any> {
    return this.http.get(`${this.url}/batch`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of batches.';

      return throwError(() => errorMessage);
    }));
  }

  getBatchById(id: number): Observable<any> {
    return this.http.get(`${this.url}/batch/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of batch by id.';

      return throwError(() => errorMessage);
    }));
  }

  getAllSuppliers(): Observable<SupplierInterface[]> {
    return this.http.get<SupplierInterface[]>(`${this.url}/supplier`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of suppliers.';

      return throwError(() => errorMessage);
    }));
  }

  getSupplierById(id: number): Observable<SupplierInterface> {
    return this.http.get<SupplierInterface>(`${this.url}/supplier/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occure during fetching of supplier by id.';

      return throwError(() => errorMessage);
    }));
  }

  getAllAIO(): Observable<any> {
    return this.http.get(`${this.url}/device/aio`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of all AIOs.';

      return throwError(() => errorMessage);
    }));
  }

  getAllAIOByBatchId(id: number): Observable<any> {
    return this.http.get(`${this.url}/device/aio/batch/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of AIOs by batch id.';

      return throwError(() => errorMessage);
    }));
  }

  getAllLaptop(): Observable<any> {
    return this.http.get(`${this.url}/device/laptop`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of all laptops.';

      return throwError(() => errorMessage);
    }));
  }

  getAllLaptopByBatchId(id: number): Observable<any> {
    return this.http.get(`${this.url}/device/laptop/batch/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of laptops by batch id.';

      return throwError(() => errorMessage);
    }));
  }

  getAllTablet(): Observable<any> {
    return this.http.get(`${this.url}/device/tablet`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of all tablets.';

      return throwError(() => errorMessage);
    }));
  }

  getAllTabletByBatchId(id: number): Observable<any> {
    return this.http.get(`${this.url}/device/tablet/batch/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of tablets by batch id.';

      return throwError(() => errorMessage);
    }));
  }

  getAllComputer(): Observable<any> {
    return this.http.get(`${this.url}/device/computer`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of all computers.';

      return throwError(() => errorMessage);
    }));
  }

  getAllComputerByBatchId(id: number): Observable<any> {
    return this.http.get(`${this.url}/device/computer/batch/:id`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of computers by batch id.';

      return throwError(() => errorMessage);
    }));
  }

  getAllRouter(): Observable<any> {
    return this.http.get(`${this.url}/device/router`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of all routers.';

      return throwError(() => errorMessage);
    }));
  }

  getAllRouterByBatchId(id: number): Observable<any> {
    return this.http.get(`${this.url}/device/router/batch/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of routers by batch id.';

      return throwError(() => errorMessage);
    }));
  }

  getAllPrinter(): Observable<any> {
    return this.http.get(`${this.url}/device/printer`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of all printers.';

      return throwError(() => errorMessage);
    }));
  }

  getAllPrinterByBatchId(id: number): Observable<any> {
    return this.http.get(`${this.url}/device/printer/batch/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of printers by batch id.';

      return throwError(() => errorMessage);
    }));
  }

  getAllScanner(): Observable<any> {
    return this.http.get(`${this.url}/device/scanner`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of all scanners.';

      return throwError(() => errorMessage);
    }));
  }

  getAllScannerByBatchId(id: number): Observable<any> {
    return this.http.get(`${this.url}/device/scanner/batch/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of scanners by batch id.';

      return throwError(() => errorMessage);
    }));
  }

  //PUT Requests
  putSupplier(supplier: Omit<SupplierInterface, 'id'>, id: number): Observable<any> {
    return this.http.put(`${this.url}/supplier/${id}`, supplier, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during updating of supplier';

      return throwError(() => errorMessage);
    }));
  }

  //PATCH Requests

  //DELETE Requests
  deleteBatch(id: number): Observable<any> {
    return this.http.delete(`${this.url}/batch/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during deleting of batch';

      return throwError(() => errorMessage);
    }));
  }

  deleteSupplier(id: number): Observable<any> {
    return this.http.delete(`${this.url}/supplier/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during deleting of supplier';

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
