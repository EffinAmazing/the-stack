import { Injectable } from '@angular/core';
import { SignUPFormData } from '../../shared/models/users';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ResponseMappers } from '../../shared/mappers/response-mapper.helper';
import {  environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  serverURI = environment.serverURI + '/';

  constructor( private http: HttpClient, private mapper: ResponseMappers ) {   }

  createUser(data: SignUPFormData): Observable<any> {
    return this.mapper.mapResponse(this.http.post(`${this.serverURI}users/signup`, { data }));
  }

  getUserByCode(code): Observable<any> {
    return this.mapper.mapResponse(this.http.get(`${this.serverURI}users/bycode?code=${code}`));
  }

  completeUserSignup(id, code, data): Observable<any> {
    return this.mapper.mapResponse(this.http.post(`${this.serverURI}users/complete/${id}`, { code, data }));
  }

  signInUser() {

  }
}
