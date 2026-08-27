import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { countryCode } from '../helpers/data';
import { Country } from '../../models/countryData.model';
import { FALLBACK_GEO_LOCATION, userGeoLocation as userGeoLocationState } from '../location.state';

@Injectable({
  providedIn: 'root'
})
export class DataProviderService {
  private baseUrl = (environment as any).baseUrl;
  private phoneNumberCodes = countryCode;
  // Kept for backward compatibility: components can still use `dataProvider.userGeoLocation()`.
  // The underlying value is the global signal from `core/location.state.ts`.
  public userGeoLocation = userGeoLocationState;

  constructor(private http: HttpClient) { }

  public getPhoneCode() {
    return this.phoneNumberCodes;
  }

  // public getUserGeoLocation() {
  //   this.http.get<IpLocation>('https://api.ipapi.com/api/check?access_key=e74be68b68333696388e3200aeb75697')
  //     .subscribe({
  //       next: (data) => {
  //         console.log('Data:', data);
  //       //  this.userGeoLocation.set(data);
  //       this.userGeoLocation.set(FALLBACK_GEO_LOCATION);
  //       },
  //       error: () => {
  //       //  this.userGeoLocation.set(FALLBACK_GEO_LOCATION);
  //       }
  //     });
  // }
  public getUserGeoLocation() {
  this.http.get<any>(`${this.baseUrl}Data/geo`)
    .subscribe({
      next: (res) => {
        const data = res?.Result;

        if (!data) {
          this.userGeoLocation.set(FALLBACK_GEO_LOCATION);
          return;
        }

        this.userGeoLocation.set({
          city: data.city,
          region: data.region_name,
          country: data.country_code,
          country_name: data.country_name,
          country_code: data.country_code,
          country_capital: data.location?.capital,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.time_zone?.id,
          currency: data.currency?.code,
          currency_name: data.currency?.name,
          languages: data.location?.languages?.map((l: any) => l.code).join(',')
        });
      },
      error: () => {
        this.userGeoLocation.set(FALLBACK_GEO_LOCATION);
      }
    });
}

  public getCountryCodes() {
    return this.http.get(this.baseUrl + 'Data/country-codes').pipe(
      map((res: any) => {
        return res.Result.map((data: any) => new Country(data));
      })
    );
  }

}
