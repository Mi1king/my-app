import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfig } from './app.config';
import { Observable, of } from 'rxjs';
import { Project, Buoy, Position } from './interfaces';


@Injectable({
  providedIn: 'root'
})
export class BuoyService {

  private API = AppConfig.settings.apiServer.metadata;

  private buoyURL = this.API + '/buoy';  // URL to web api
  private projetURL = this.API + '/project';  // URL to web api
  private positionURL = this.API + '/position';  // URL to web api

  
  private getAllBuoyURL = this.buoyURL + '/all';  // URL to web api
  private getAllProjetURL = this.projetURL + '/all';  // URL to web api
  private getAllPositionURL = this.positionURL + '/all';  // URL to web api



  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
    })
  };


  constructor(private http: HttpClient) { }
  
  getAllBuoy(): Observable<any> {
    return this.http.get(this.getAllBuoyURL, this.httpOptions);
  }

  getAllProject(): Observable<any> {
    return this.http.get(this.getAllProjetURL, this.httpOptions);
  }

  getAllPosition(): Observable<any> {
    return this.http.get(this.getAllPositionURL, this.httpOptions);
  }



}
