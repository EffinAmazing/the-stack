import { Injectable } from '@angular/core';
import { SignUPFormData } from '../../shared/models/users';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ResponseMappers } from '../../shared/mappers/response-mapper.helper';
import {  environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {
  serverURI = environment.serverURI + '/';

  constructor( private http: HttpClient, private mapper: ResponseMappers ) {   }

  getUserByCode(code): Observable<any> {
    return this.mapper.mapResponse(this.http.get(`${this.serverURI}users/bycode?code=${code}`));
  }

  getToolsList(offset): Observable<any> {
    return this.mapper.mapResponse(this.http.get(`${this.serverURI}admin/tools?offset=${offset}`));
  }

  searchToolsList(name,offset): Observable<any> {
    return this.mapper.mapResponse(this.http.get(`${this.serverURI}admin/tools/search?name=${name}&offset=${offset}`));
  }

  //TODO
  //get tools

  //TODO
  //update tool



}
