import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments/environment";
import {catchError, map} from "rxjs/operators";
import {throwError} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CoordinatesService {

  configSatellites = environment.urlSatellites

  constructor(private http: HttpClient) { }

  getCoordinates() {
   return this.http.get(
      this.configSatellites
    ).pipe(
      map((res: any) => {
        return {
          longitude: res.longitude,
          latitude: res.latitude
        }
        }
      ),
      catchError(error => throwError(error) ));
  }

}
