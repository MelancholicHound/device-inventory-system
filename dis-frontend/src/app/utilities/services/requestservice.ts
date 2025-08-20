import { Injectable, signal, computed, inject } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, throwError } from 'rxjs';
import { first, catchError, tap } from 'rxjs/operators';

import { UserInterface } from '../models/UserInterface';
import { BatchInterface } from '../models/BatchInteface';
import { SupplierInterface } from '../models/SupplierInterface';

@Injectable({
  providedIn: 'root'
})
export class Requestservice {
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

  // POST
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
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during login.';

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

  postBatch(batch: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this._token()}`
    });

    return this.http.post(`${this.url}/batch`, batch, { headers })
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

  postAIOBrand(brand: string): Observable<any> {
    const endpoint = `${this.url}/brand/aio`;
    const params = new HttpParams().set('name', brand);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of AIO brand.';

      return throwError(() => errorMessage);
    }));
  }

  postLaptopBrand(brand: string): Observable<any> {
    const endpoint = `${this.url}/brand/laptop`;
    const params = new HttpParams().set('name', brand);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of laptop brand.';

      return throwError(() => errorMessage);
    }));
  }

  postPrinterBrand(brand: string): Observable<any> {
    const endpoint = `${this.url}/brand/printer`;
    const params = new HttpParams().set('name', brand);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of printer brand.';

      return throwError(() => errorMessage);
    }));
  }

  postRouterBrand(brand: string): Observable<any> {
    const endpoint = `${this.url}/brand/router`;
    const params = new HttpParams().set('name', brand);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of router brand.';

      return throwError(() => errorMessage);
    }));
  }

  postScannerBrand(brand: string): Observable<any> {
    const endpoint = `${this.url}/brand/scanner`;
    const params = new HttpParams().set('name', brand);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of laptop brand.';

      return throwError(() => errorMessage);
    }));
  }

  postTabletBrand(brand: string): Observable<any> {
    const endpoint = `${this.url}/brand/tablet`;
    const params = new HttpParams().set('name', brand);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of tablet brand.';

      return throwError(() => errorMessage);
    }));
  }

  postMotherboardBrand(brand: string): Observable<any> {
    const endpoint = `${this.url}/brand/motherboard`;
    const params = new HttpParams().set('name', brand);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of motherboard brand.';

      return throwError(() => errorMessage);
    }));
  }

  postProcessorBrand(brand: string): Observable<any> {
    const endpoint = `${this.url}/brand/processor`;
    const params = new HttpParams().set('name', brand);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of processor brand.';

      return throwError(() => errorMessage);
    }));
  }

  postProcessorSeriesBrand(id: number, brand: string): Observable<any> {
    const endpoint = `${this.url}/brand/processor/${id}/series`;
    const params = new HttpParams().set('name', brand);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message
      || 'An unknown error occured during saving of processor series by brand id.';

      return throwError(() => errorMessage);
    }));
  }

  postChipsetBrand(brand: string): Observable<any> {
    const endpoint = `${this.url}/brand/chipset`;
    const params = new HttpParams().set('name', brand);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of chipset brand.';

      return throwError(() => errorMessage);
    }));
  }

  postRAMCapacity(capacity: number): Observable<any> {
    const endpoint = `${this.url}/capacity/ram`;
    const params = new HttpParams().set('capacity', capacity);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of RAM capacity.';

      return throwError(() => errorMessage);
    }));
  }

  postStorageCapacity(capacity: number): Observable<any> {
    const endpoint = `${this.url}/capacity/storage`;
    const params = new HttpParams().set('capacity', capacity);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of storage capacity.';

      return throwError(() => errorMessage);
    }));
  }

  postGPUCapacity(capacity: number): Observable<any> {
    const endpoint = `${this.url}/capacity/gpu`;
    const params = new HttpParams().set('capacity', capacity);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of GPU capacity.';

      return throwError(() => errorMessage);
    }));
  }

  postPrinterType(type: string): Observable<any> {
    const endpoint = `${this.url}/misc/type/printer`;
    const params = new HttpParams().set('type', type);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of printer type.';

      return throwError(() => errorMessage);
    }));
  }

  postScannerType(type: string): Observable<any> {
    const endpoint = `${this.url}/misc/type/scanner`;
    const params = new HttpParams().set('type', type);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of scanner type.';

      return throwError(() => errorMessage);
    }));
  }

  postStorageType(type: string): Observable<any> {
    const endpoint = `${this.url}/misc/type/storage`;
    const params = new HttpParams().set('type', type);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of storage type.';

      return throwError(() => errorMessage);
    }));
  }

  postNetworkSpeed(speed: number): Observable<any> {
    const endpoint = `${this.url}/misc/networkspeed`;
    const params = new HttpParams().set('speed', speed);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of connection.';

      return throwError(() => errorMessage);
    }));
  }

  postAntennaCount(count: number): Observable<any> {
    const endpoint = `${this.url}/misc/antennacount`;
    const params = new HttpParams().set('count', count);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of antenna count.';

      return throwError(() => errorMessage);
    }));
  }

  postConnection(name: string): Observable<any> {
    const endpoint = `${this.url}/services/connection`;
    const params = new HttpParams().set('name', name);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of connection.';

      return throwError(() => errorMessage);
    }));
  }

  postPeripheral(name: string): Observable<any> {
    const endpoint = `${this.url}/services/peripherals`;
    const params = new HttpParams().set('name', name);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of peripheral.';

      return throwError(() => errorMessage);
    }));
  }

  postSoftwareOS(name: string): Observable<any> {
    const endpoint = `${this.url}/services/software/os`;
    const params = new HttpParams().set('name', name);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of operating system.';

      return throwError(() => errorMessage);
    }));
  }

  postSoftwareProdTool(name: string): Observable<any> {
    const endpoint = `${this.url}/services/software/productivitytool`;
    const params = new HttpParams().set('name', name);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of productivity tool.';

      return throwError(() => errorMessage);
    }));
  }

  postSoftwareSecurity(name: string): Observable<any> {
    const endpoint = `${this.url}/services/software/security`;
    const params = new HttpParams().set('name', name);

    return this.http.post(endpoint, null, {
      headers: this.httpOptionsWithToken().headers,
      params
    })
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of security.';

      return throwError(() => errorMessage);
    }));
  }

  postAIO(aio: any[]): Observable<any> {
    return this.http.post(`${this.url}/device/aio`, aio, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of AIO.';

      return throwError(() => errorMessage);
    }));
  }

  postComputer(computer: any[]): Observable<any> {
    return this.http.post(`${this.url}/device/computer`, computer, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of computer.';

      return throwError(() => errorMessage);
    }));
  }

  postLaptop(laptop: any[]): Observable<any> {
    return this.http.post(`${this.url}/device/laptop`, laptop, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of laptop.';

      return throwError(() => errorMessage);
    }));
  }

  postPrinter(printer: any[]): Observable<any> {
    return this.http.post(`${this.url}/device/printer`, printer, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of printer.';

      return throwError(() => errorMessage);
    }));
  }

  postRouter(router: any[]): Observable<any> {
    return this.http.post(`${this.url}/device/router`, router, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.messwage || 'An unknown error occured during saving of router.';

      return throwError(() => errorMessage);
    }));
  }

  postScanner(scanner: any[]): Observable<any> {
    return this.http.post(`${this.url}/device/scanner`, scanner, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of scanner.';

      return throwError(() => errorMessage);
    }));
  }

  postTablet(tablet: any[]): Observable<any> {
    return this.http.post(`${this.url}/device/tablet`, tablet, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of tablet.';

      return throwError(() => errorMessage);
    }));
  }

  postUPS(ups: any[]): Observable<any> {
    return this.http.post(`${this.url}/device/ups`, ups, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during saving of UPS.';

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

  getDivisions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/division`, this.httpOptionsWithToken())
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

  getSectionsByDivisionId(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/section/division/${id}`, this.httpOptionsWithToken())
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

  getAllBatches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/batch`, this.httpOptionsWithToken())
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

  getAllAIOBrand(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/brand/aio`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all AIO brands.';

      return throwError(() => errorMessage);
    }));
  }

  getAIOBrandById(id: number): Observable<any> {
    return this.http.get(`${this.url}/brand/aio/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching specific AIO brand.';

      return throwError(() => errorMessage);
    }));
  }

  getAllLaptopBrand(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/brand/laptop`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all laptop brands.';

      return throwError(() => errorMessage);
    }));
  }

  getLaptopBrandById(id: number): Observable<any> {
    return this.http.get(`${this.url}/brand/laptop/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching specific laptop brand.';

      return throwError(() => errorMessage);
    }));
  }

  getAllPrinterBrand(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/brand/printer`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all printer brands.';

      return throwError(() => errorMessage);
    }));
  }

  getPrinterBrandById(id: number): Observable<any> {
    return this.http.get(`${this.url}/brand/printer/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching specific printer brand.';

      return throwError(() => errorMessage);
    }));
  }

  getAllRouterBrand(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/brand/router`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all router brands.';

      return throwError(() => errorMessage);
    }));
  }

  getRouterBrandById(id: number): Observable<any> {
    return this.http.get(`${this.url}/brand/router/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching specific router brand.';

      return throwError(() => errorMessage);
    }));
  }

  getAllScannerBrand(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/brand/scanner`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all scanner brands.';

      return throwError(() => errorMessage);
    }));
  }

  getScannerBrandById(id: number): Observable<any> {
    return this.http.get(`${this.url}/brand/scanner/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching specific scanner brand.';

      return throwError(() => errorMessage);
    }));
  }

  getAllTabletBrand(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/brand/tablet`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all tablet brands.';

      return throwError(() => errorMessage);
    }));
  }

  getTabletBrandById(id: number): Observable<any> {
    return this.http.get(`${this.url}/brand/tablet/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching specific tablet brand.';

      return throwError(() => errorMessage);
    }));
  }

  getAllUPSBrand(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/brand/ups`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all UPS brands.';

      return throwError(() => errorMessage);
    }));
  }

  getUPSBrandById(id: number): Observable<any> {
    return this.http.get(`${this.url}/brand/ups/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching specific motherboard brand.';

      return throwError(() => errorMessage);
    }));
  }

  getAllMotherboardBrand(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/brand/motherboard`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all motherboard brands.';

      return throwError(() => errorMessage);
    }));
  }

  getMotherboardBrandById(id: number): Observable<any> {
    return this.http.get(`${this.url}/brand/motherboard/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching specific motherboard brand.';

      return throwError(() => errorMessage);
    }));
  }

  getAllProcessorBrand(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/brand/processor`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all processor brands.';

      return throwError(() => errorMessage);
    }));
  }

  getProcessorBrandById(id: number): Observable<any> {
    return this.http.get(`${this.url}/brand/processor/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching specific processor brand.';

      return throwError(() => errorMessage);
    }));
  }

  getAllProcessorSeriesByBrandId(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/brand/processor/${id}/series`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all processor series by brand id.';

      return throwError(() => errorMessage);
    }));
  }

  getAllChipsetBrand(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/brand/chipset`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all chipset brands.';

      return throwError(() => errorMessage);
    }));
  }

  getChipsetBrandById(id: number): Observable<any> {
    return this.http.get(`${this.url}/brand/chipset/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching specific chipset brand.';

      return throwError(() => errorMessage);
    }));
  }

  getAllRAMCapacities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/capacity/ram`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all RAM capacity.';

      return throwError(() => errorMessage);
    }));
  }

  getAllStorageCapacities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/capacity/storage`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all storage capacity.';

      return throwError(() => errorMessage);
    }));
  }

  getAllGPUCapacities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/capacity/gpu`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all gpu capacity.';

      return throwError(() => errorMessage);
    }));
  }

  getPrinterTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/misc/type/printer`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all printer types.';

      return throwError(() => errorMessage);
    }));
  }

  getScannerTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/misc/type/scanner`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all scanner types.';

      return throwError(() => errorMessage);
    }));
  }

  getStorageType(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/misc/type/storage`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all storage types.';

      return throwError(() => errorMessage);
    }));
  }

  getNetworkSpeed(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/misc/networkspeed`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all network speed.';

      return throwError(() => errorMessage);
    }));
  }

  getAntennaCount(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/misc/antennacount`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all antenna count.';

      return throwError(() => errorMessage);
    }));
  }

  getAllConnections(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/services/connection`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all connections.';

      return throwError(() => errorMessage);
    }));
  }

  getAllPeripherals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/services/peripheral`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all peripherals.';

      return throwError(() => errorMessage);
    }));
  }

  getAllSoftwareOS(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/services/softwares/os`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all operating systems.';

      return throwError(() => errorMessage);
    }));
  }

  getAllSoftwareProdTool(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/services/softwares/productivitytool`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all peripherals.';

      return throwError(() => errorMessage);
    }));
  }

  getAllSoftwareSecurity(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/services/softwares/security`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all securities.';

      return throwError(() => errorMessage);
    }));
  }

  getAllAIO(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/device/aio`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of all AIOs.';

      return throwError(() => errorMessage);
    }));
  }

  getAIOById(id: number): Observable<any> {
    return this.http.get(`${this.url}/device/aio/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching specific AIO.';

      return throwError(() => errorMessage);
    }));
  }

  getAllAIOByBatchId(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/device/aio/batch/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of AIOs by batch id.';

      return throwError(() => errorMessage);
    }));
  }

  getAllLaptop(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/device/laptop`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of all laptops.';

      return throwError(() => errorMessage);
    }));
  }

  getLaptopById(id: number): Observable<any> {
    return this.http.get(`${this.url}/device/laptop/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching specific laptop.';

      return throwError(() => errorMessage);
    }));
  }

  getAllLaptopByBatchId(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/device/laptop/batch/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of laptops by batch id.';

      return throwError(() => errorMessage);
    }));
  }

  getAllTablet(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/device/tablet`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of all tablets.';

      return throwError(() => errorMessage);
    }));
  }

  getTabletById(id: number): Observable<any> {
    return this.http.get(`${this.url}/device/tablet/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching specific tablet.';

      return throwError(() => errorMessage);
    }));
  }

  getAllTabletByBatchId(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/device/tablet/batch/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of tablets by batch id.';

      return throwError(() => errorMessage);
    }));
  }

  getAllComputer(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/device/computer`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of all computers.';

      return throwError(() => errorMessage);
    }));
  }

  getComputerById(id: number): Observable<any> {
    return this.http.get(`${this.url}/device/computer/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching specific computer.';

      return throwError(() => errorMessage);
    }));
  }

  getAllComputerByBatchId(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/device/computer/batch/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of computers by batch id.';

      return throwError(() => errorMessage);
    }));
  }

  getAllRouter(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/device/router`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of all routers.';

      return throwError(() => errorMessage);
    }));
  }

  getRouterById(id: number): Observable<any> {
    return this.http.get(`${this.url}/device/router/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching specific router.';

      return throwError(() => errorMessage);
    }));
  }

  getAllRouterByBatchId(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/device/router/batch/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of routers by batch id.';

      return throwError(() => errorMessage);
    }));
  }

  getAllPrinter(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/device/printer`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of all printers.';

      return throwError(() => errorMessage);
    }));
  }

  getPrinterById(id: number): Observable<any> {
    return this.http.get(`${this.url}/device/printer/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching specific printer.';

      return throwError(() => errorMessage);
    }));
  }

  getAllPrinterByBatchId(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/device/printer/batch/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of printers by batch id.';

      return throwError(() => errorMessage);
    }));
  }

  getAllScanner(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/device/scanner`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of all scanners.';

      return throwError(() => errorMessage);
    }));
  }

  getScannerById(id: number): Observable<any> {
    return this.http.get(`${this.url}/device/scanner/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching specific scanner.';

      return throwError(() => errorMessage);
    }));
  }

  getAllScannerByBatchId(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/device/scanner/batch/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching of scanners by batch id.';

      return throwError(() => errorMessage);
    }));
  }

  getAllUPS(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/device/ups`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all UPS.';

      return throwError(() => errorMessage);
    }));
  }

  getUPSById(id: number): Observable<any> {
    return this.http.get(`${this.url}/device/ups/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching UPS by id.';

      return throwError(() => errorMessage);
    }));
  }

  getAllUPSByBatchId(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/device/ups/batch/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during fetching all UPS by batch id.';

      return throwError(() => errorMessage);
    }));
  }

  //PUT Requests
  putSupplier(supplier: Omit<SupplierInterface, 'id'>, id: number): Observable<any> {
    return this.http.put(`${this.url}/supplier/${id}`, supplier, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during updating of supplier.';

      return throwError(() => errorMessage);
    }));
  }

  putBatch(batch: Omit<BatchInterface, 'id'>, id: number): Observable<any> {
    return this.http.put(`${this.url}/batch/${id}`, batch, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during updating of batch.';

      return throwError(() => errorMessage);
    }));
  }

  putDeviceAIO(id: number, form: any): Observable<any> {
    return this.http.put(`${this.url}/device/aio/${id}`, form, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during updating of AIO.';

      return throwError(() => errorMessage);
    }));
  }

  putDeviceComputer(id: number, form: any): Observable<any> {
    return this.http.put(`${this.url}/device/computer/${id}`, form, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during updating of computer.';

      return throwError(() => errorMessage);
    }));
  }

  putDeviceLaptop(id: number, form: any): Observable<any> {
    return this.http.put(`${this.url}/device/laptop/${id}`, form, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during updating of laptop.';

      return throwError(() => errorMessage);
    }));
  }

  putDevicePrinter(id: number, form: any): Observable<any> {
    return this.http.put(`${this.url}/device/printer/${id}`, form, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during updating of printer.';

      return throwError(() => errorMessage);
    }));
  }

  putDeviceRouter(id: number, form: any): Observable<any> {
    return this.http.put(`${this.url}/device/router/${id}`, form, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during updating of router.';

      return throwError(() => errorMessage);
    }));
  }

  putDeviceScanner(id: number, form: any): Observable<any> {
    return this.http.put(`${this.url}/device/scanner/${id}`, form, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during updating of scanner.';

      return throwError(() => errorMessage);
    }));
  }

  putDeviceTablet(id: number, form: any): Observable<any> {
    return this.http.put(`${this.url}/device/tablet/${id}`, form, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during updating of tablet.';

      return throwError(() => errorMessage);
    }));
  }

  putDeviceUPS(id: number, form: any): Observable<any> {
    return this.http.put(`${this.url}/device/ups/${id}`, form, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during updating of UPS.';

      return throwError(() => errorMessage);
    }));
  }

  //PATCH Requests
  condemnedAIO(id: number, assessment: any): Observable<any> {
    return this.http.patch(`${this.url}/device/aio/${id}`, assessment, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during updating AIO status.';

      return throwError(() => errorMessage);
    }));
  }

  condemnedComputer(id: number, assessment: any): Observable<any> {
    return this.http.patch(`${this.url}/device/computer/${id}`, assessment, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during updating computer status.';

      return throwError(() => errorMessage);
    }));
  }

  condemnedLaptop(id: number, assessment: any): Observable<any> {
    return this.http.patch(`${this.url}/device/laptop/${id}`, assessment, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during updating laptop status.';

      return throwError(() => errorMessage);
    }));
  }

  condemnedPrinter(id: number, assessment: any): Observable<any> {
    return this.http.patch(`${this.url}/device/printer/${id}`, assessment, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during updating printer status.';

      return throwError(() => errorMessage);
    }));
  }

  condemnedRouter(id: number, assessment: any): Observable<any> {
    return this.http.patch(`${this.url}/device/router/${id}`, assessment, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during updating router status.';

      return throwError(() => errorMessage);
    }));
  }

  condemnedScanner(id: number, assessment: any): Observable<any> {
    return this.http.patch(`${this.url}/device/scanner/${id}`, assessment, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during updating scanner status.';

      return throwError(() => errorMessage);
    }));
  }

  condemnedTablet(id: number, assessment: any): Observable<any> {
    return this.http.patch(`${this.url}/device/tablet/${id}`, assessment, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during updating tablet status.';

      return throwError(() => errorMessage);
    }));
  }

  condemnedUPS(id: number, assessment: any): Observable<any> {
    return this.http.patch(`${this.url}/device/ups/${id}`, assessment, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during updating UPS status.';

      return throwError(() => errorMessage);
    }));
  }

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

  deleteAIOById(id: number): Observable<any> {
    return this.http.delete(`${this.url}/device/aio/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during deleting of AIO.';

      return throwError(() => errorMessage);
    }));
  }

  deleteComputerById(id: number): Observable<any> {
    return this.http.delete(`${this.url}/device/computer/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during deleting of computer.';

      return throwError(() => errorMessage);
    }));
  }

  deleteLaptopById(id: number): Observable<any> {
    return this.http.delete(`${this.url}/device/laptop/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during deleting of laptop.';

      return throwError(() => errorMessage);
    }));
  }

  deleteTabletById(id: number): Observable<any> {
    return this.http.delete(`${this.url}/device/tablet/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during deleting of tablet.';

      return throwError(() => errorMessage);
    }));
  }

  deleteRouterById(id: number): Observable<any> {
    return this.http.delete(`${this.url}/device/router/:id`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during deleting of router.';

      return throwError(() => errorMessage);
    }));
  }

  deletePrinterById(id: number): Observable<any> {
    return this.http.delete(`${this.url}/device/printer/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during deleting of printer.';

      return throwError(() => errorMessage);
    }));
  }

  deleteScannerById(id: number): Observable<any> {
    return this.http.delete(`${this.url}/device/scanner/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during deleting of scanner.';

      return throwError(() => errorMessage);
    }));
  }

  deleteUPSById(id: number): Observable<any> {
    return this.http.delete(`${this.url}/device/ups/${id}`, this.httpOptionsWithToken())
    .pipe(first(), catchError((error: any) => {
      const errorMessage = error?.error?.error?.message || 'An unknown error occured during deleting of UPS.';

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

  downloadFile(fileName: string): Observable<any> {
    return this.http.get(`${this.url}/dir/${fileName}`, { responseType: 'blob' });
  }

  isLoggedIn = computed(() => !!this._token());
}
