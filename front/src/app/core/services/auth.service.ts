import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ResponseMappers } from '../../shared/mappers/response-mapper.helper';
import {  environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  serverURI = environment.serverURI + '/';

  constructor(private http: HttpClient, private mapper: ResponseMappers ) { 

  }

  login(email:string, password:string ) {
    return this.mapper.mapResponse(this.http.post(`${this.serverURI}users/signin`, { username: email, password }))
  }

  logout() {
    localStorage.removeItem("session_user");
    localStorage.removeItem("auth_token");
  }

  getCurrentUser() {
    let str = localStorage.getItem("session_user");
    return JSON.parse( decodeURI(str) );
  }

  setSession(authResult) {
    let userStr = encodeURI( JSON.stringify(authResult.user) );
    localStorage.setItem('session_user', userStr);
    localStorage.setItem('auth_token', authResult.token);
  }    
}
