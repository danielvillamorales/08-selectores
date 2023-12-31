import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country.interface';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseUrl: string = 'https://restcountries.com/v3.1';

  private _regions: Region[] = [Region.Africa, Region.Americas, Region.Asia, Region.Europe, Region.Oceania];

  constructor(private http: HttpClient) { }

  get regions(): Region[] {
    return [...this._regions];
  }

  getCountriesByRegion(region: Region): Observable<SmallCountry[]> {
    const url = `${this.baseUrl}/region/${region}?fields=cca3,name,borders`;
    if (!region) return of([]);
    return this.http.get<Country[]>(url).pipe(
      map(countries =>
        countries.map(country => ({
          cca3: country.cca3,
          name: country.name.common,
          borders: country.borders?? []
        }))),
     // tap(response => console.log(response)));
    );
  }

  getCountryByCode(cca3: string): Observable<SmallCountry> {
    if (!cca3) return of();
    const url = `${this.baseUrl}/alpha/${cca3}?fields=cca3,name,borders`;
    return this.http.get<Country>(url).pipe(
      map(country => ({
        cca3: country.cca3,
        name: country.name.common,
        borders: country.borders?? []
      }))
    );
  }

  getCountryBorderByCodes(borders: string[]): Observable<SmallCountry[]> {
    if (!borders) return of([]);
    const countryRequests: Observable<SmallCountry>[] = [];
    borders.forEach(cca3 => {
      const request = this.getCountryByCode(cca3);
      countryRequests.push(request);
    });
    return combineLatest(countryRequests);
  }
}
