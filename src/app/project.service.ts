import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfig } from './app.config';
import { Observable, of } from 'rxjs';
import { Project } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private API = AppConfig.settings.apiServer.metadata;

  private getProjetURL = this.API + '/mock/data/project';  // URL to web api

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
    })
  };

  constructor(private http: HttpClient) { }

  getPositions(): Observable<Project[]> {
    return this.http.get<Project[]>(this.getProjetURL);
  }
}
