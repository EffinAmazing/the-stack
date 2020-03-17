import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BluePrintResp, BluePrintTool } from "../../shared/models/tool";
import { ResponseMappers } from '../../shared/mappers/response-mapper.helper';

@Injectable({
  providedIn: 'root'
})
export class BlueprintsService {
  serverURI: string = "http://localhost:9000/";

  constructor( private http: HttpClient, private mapper: ResponseMappers ) { }

  getDomainTools(domain: string): Observable<BluePrintResp> {
    return this.mapper.mapResponse(this.http.get<BluePrintResp>(`${this.serverURI}blueprints/tools?domain=${domain}`));
  }

  updateNodeTool(nodeID: string, data ): Observable<BluePrintTool>{
    return this.mapper.mapResponse(this.http.put<BluePrintTool>(`${this.serverURI}toolsnodes/${nodeID}`, { data }));
  }

  hideNodes(ids: string[]): Observable<any> {
    return this.mapper.mapResponse(this.http.post(`${this.serverURI}toolshide/`, { ids } ));
  }
}
