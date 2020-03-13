import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Tool } from "../../shared/models/tool";
import { ResponseMappers } from '../../shared/mappers/response-mapper.helper';

@Injectable({
  providedIn: 'root'
})
export class BlueprintsService {
  serverURI: string = "http://localhost:9000/";

  constructor( private http: HttpClient, private mapper: ResponseMappers ) { }

  getDomainTools(domain: string): Observable<Tool[]> {
    return this.mapper.mapResponse(this.http.get<Tool[]>(`${this.serverURI}blueprints/tools?domain=${domain}`));
  }
}
