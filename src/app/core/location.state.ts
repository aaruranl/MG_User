import { signal } from '@angular/core';
import { IpLocation } from '../models/index.model';

// Shared geolocation state (read anywhere in the app).
export const FALLBACK_GEO_LOCATION: IpLocation = {
  city: 'Zurich',
  region: 'Zurich',
  country: 'CH',
  country_name: 'Switzerland',
  country_code: 'CH',
  country_capital: 'Bern',
  latitude: 47.3769,
  longitude: 8.5417,
  timezone: 'Europe/Zurich',
  currency: 'CHF',
  currency_name: 'Franc',
  languages: 'de,fr,it,en',
};

export const userGeoLocation = signal<IpLocation | null>(null);
