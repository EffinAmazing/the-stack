import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseMappers } from '../../shared/mappers/response-mapper.helper';
import { Observable } from 'rxjs';
import {  environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadImagesService {
  serverURI = environment.serverURI;

  constructor( private http: HttpClient, private mapper: ResponseMappers) {  }

  uploadImgFor( id, formData ): Observable<string> {
    return this.mapper.mapResponse(this.http.post(`${this.serverURI}uploads/${id}`, formData));
  }
}
