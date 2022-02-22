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
  private getConditionalPositionURL = this.positionURL + '/condition';  // URL to web api


  private addBuoyURL = this.buoyURL + '/add';  // URL to web api
  private addProjectURL = this.projectURL + '/add';  // URL to web api
  // private addPositionURL = this.positionURL + '/add';  // URL to web api


  private deleteBuoyURL = this.buoyURL + '/delete';  // URL to web api
  private deleteProjectURL = this.projectURL + '/delete';  // URL to web api


  private updateBuoyURL = this.buoyURL + '/update';  // URL to web api
  private updateProjectURL = this.projectURL + '/update';  // URL to web api
  // private addPositionURL = this.positionURL + '/add';  // URL to web api



  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
      // 'Accept': '*/*',
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
        .set('startTime', dateRange[0])
        .set('endTime', dateRange[1])
    };
    return this.http.get(this.getConditionalPositionURL, httpOptions);
  }

  addBuoy(buoy: any) {
    return this.http.post(this.addBuoyURL, buoy, this.httpOptions).subscribe(
      data => {
        console.log(data);
      });
  }

  deleteBuoy(buoy: any) {
    return this.http.post(this.deleteBuoyURL, buoy, this.httpOptions).subscribe(
      data => {
        console.log(data);
      });
  }
  
  updateBuoy(buoy: any) {
    this.http.post(this.updateBuoyURL, buoy, this.httpOptions).subscribe(
      data => {
        console.log(data);
      });
  }



  addProject(project: any) {
    return this.http.post(this.addProjectURL, project, this.httpOptions).subscribe(
      data => {
        console.log(data);
      });
  }

  deleteProject(project: any) {
    return this.http.post(this.deleteProjectURL, project, this.httpOptions).subscribe(
      data => {
        console.log(data);
      });
  }

  updateProject(project: any) {
    return this.http.post(this.updateProjectURL, project, this.httpOptions).subscribe(
      data => {
        console.log(data);
      });
  }


}
