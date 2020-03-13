import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { Promise } from 'q';
@Injectable({
  providedIn: 'root'
})
export class ResponseMappers {

  constructor() { }

  public mapResponse(observable: Observable<any>) {
    return observable.pipe(
      map( (response: any) => { 
          return response.result;
      }),
      catchError( error => {
        if (error) {
          return throwError(error);
        }
      })
   );
  }

  public getParams(filters, keyName: string): string {
    let params = ['?'];
    if (filters && filters.length) {
        filters.forEach(filter => {
          params.push(`${keyName}=${filter}&`);
        });
    }

    return params.join('');
 }
}