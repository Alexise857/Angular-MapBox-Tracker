import {Component, OnInit} from '@angular/core';
import {environment} from "../environments/environment";
import * as Mapboxgl from "mapbox-gl"
import {GeoJSONSource} from "mapbox-gl";
import {CoordinatesService} from "../services/coordinates.service";
import {tap} from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'MapBox';

  map: Mapboxgl.Map | undefined;
  // Initializing ship
  geoSourceJson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-76.9414921, -12.0673545]
        },
        properties: null
      }
    ]
  }

  layer: mapboxgl.AnyLayer | undefined
  intervalId!: number;

  constructor(private coordinatesService: CoordinatesService) {
  }

  ngOnInit(): void {
    this.mapBoxInit()
    this.intervalId = setInterval(() => {
      this.getLocation();
    }, 5000);
  }

  mapBoxInit() {
    (Mapboxgl as any).accessToken = environment.mapBoxKey

    this.map = new Mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/streets-v11', // style URL
      center: [-76.9414921, -12.0673545], // LNG - LAT
      zoom: 17 // starting zoom
    });

    this.map.on('load', (e) => {

      this.map?.addSource('olo',{
        type: 'geojson',
        data: this.geoSourceJson
      });

      this.map?.addLayer({
        id: 'olo',
        type: 'symbol',
        source: 'olo',
        layout: {
          "icon-image": 'rocket-15'
        },
      });

    })
  }

  flyToMap(coordinates:any) {
    this.map?.flyTo({
      center: [coordinates.longitude, coordinates.latitude],
      speed: 0.5
    });
  }

  updateSource() {
    (this.map?.getSource('olo') as GeoJSONSource).setData(this.geoSourceJson);
  }

  // : Observable<GeoJSON.FeatureCollection<GeoJSON.Geometry>>

  getLocation() {
    this.coordinatesService.getCoordinates().pipe(
      tap( coordinates => {
        this.geoSourceJson = {
          ... this.geoSourceJson, features: [{ ...this.geoSourceJson.features[0],
          geometry: { ...this.geoSourceJson.features[0].geometry,
          type: 'Point', coordinates: [coordinates.longitude, coordinates.latitude]  } }]
        };
        this.flyToMap(coordinates);
        this.updateSource();
      } )
    ).subscribe()
  }
}
