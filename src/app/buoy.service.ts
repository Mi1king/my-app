import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
  private projectURL = this.API + '/project';  // URL to web api
  private positionURL = this.API + '/position';  // URL to web api


  private getAllBuoyURL = this.buoyURL + '/all';  // URL to web api
  private getAllProjectURL = this.projectURL + '/all';  // URL to web api
  private getAllPositionURL = this.positionURL + '/all';  // URL to web api
  private getConditionalPositionURL = this.positionURL + '/condition ';  // URL to web api


  private addBuoyURL = this.buoyURL + '/add';  // URL to web api
  private addProjectURL = this.projectURL + '/add';  // URL to web api
  // private addPositionURL = this.positionURL + '/add';  // URL to web api


  private updateBuoyURL = this.buoyURL + '/update';  // URL to web api
  private updateProjectURL = this.projectURL + '/update';  // URL to web api
  // private addPositionURL = this.positionURL + '/add';  // URL to web api



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
    return this.http.get(this.getAllProjectURL, this.httpOptions);
  }

  getAllPosition(): Observable<any> {
    return this.http.get(this.getAllPositionURL, this.httpOptions);
  }

  getConditionalPosition(buoy: any, dateRange: any): Observable<any> {
    let httpOptions = {
      headers: this.httpOptions.headers,
      params: new HttpParams()
        .set('driftingbuoy_imei', buoy.imei)
        // .set('startTime', dateRange[0])
        // .set('endTime', dateRange[1])
    };
    //TODO:check the conditonal position function after backend service is completed
    return this.http.post(this.getConditionalPositionURL, httpOptions);
  }

  updateBuoy(buoy: any) {
    return this.http.post(this.updateBuoyURL, buoy, this.httpOptions);
  }
  updateProject(prject: any) {
    return this.http.post(this.updateProjectURL, prject, this.httpOptions);
  }


}
