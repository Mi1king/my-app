import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParamsOptions } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { MassMarker, Lan } from './interfaces';
import { AppConfig } from './app.config';
@Injectable({
  providedIn: 'root'
})
export class MyPositionsService {
  private positionsUrl = 'api/positions';  // URL to web api
  private massMarkerUrl = 'api/massMarker';  // URL to web api
  private API = AppConfig.settings.apiServer.metadata;
  private dataURL = this.API + '/mock/data/all';  // URL to web api

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
    })
  };

  constructor(private http: HttpClient
  ) {
  }

  getPositions(): Observable<Lan[]> {
    // return this.http.get<Position[]>(this.positionsUrl);
    return this.http.get<Lan[]>(this.positionsUrl);
  }
  getData(): Observable<any> {
    return this.http.get(this.dataURL, this.httpOptions);
  }


  getMassMarker(): Observable<MassMarker[]> {
    return this.http.get<MassMarker[]>(this.massMarkerUrl);
    // return this.http.post(this.massMarkerUrl, '');
  }
}

