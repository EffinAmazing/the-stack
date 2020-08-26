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
  first = true;

  constructor(private http: HttpClient, private mapper: ResponseMappers ) {
    window['dataLayer'] = window['dataLayer'] || [];
  }

  login(email:string, password:string ) {
    return this.mapper.mapResponse(this.http.post(`${this.serverURI}users/signin`, { username: email, password }));
  }

  logout() {
    localStorage.removeItem("session_user");
    localStorage.removeItem("auth_token");
  }

  getCurrentUser() {
    const str = localStorage.getItem("session_user");
    const user = JSON.parse( decodeURI(str) );
    if (user && this.first && !window['authCompleted']) {
      this.first = false;
      window['authCompleted'] = true;
      window['dataLayer'].push({
        event: 'stackbuilder.auth',
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    }
    return user;
  }

  setSession(authResult) {
    const userStr = encodeURI( JSON.stringify(authResult.user) );
    if (authResult.user && this.first && !window['authCompleted']) {
      this.first = false;
      window['authCompleted'] = true;
      window['dataLayer'].push({
        event: 'stackbuilder.auth',
        user: {
          email: authResult.user.email,
          firstName: authResult.user.firstName,
          lastName: authResult.user.lastName
        }
      });
    }
    localStorage.setItem('session_user', userStr);
    localStorage.setItem('auth_token', authResult.token);
  }
}
