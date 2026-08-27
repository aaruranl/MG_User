export class StateProvince {

  name: string;

  constructor(obj?: any) {

    this.name = obj?.name ?? '';
  }
}

export class Language {
  name: string;

  constructor(obj?: any) {
    this.name = obj?.name ?? '';
  }
}

export class Country {
  country: string;
  iso: string;
  currencyCode: string;
  code: string;
  flags: { svg: string; png: string };
  independent: boolean;
  stateProvinces: StateProvince[];
  languages: Language[];

  constructor(obj?: any) {
    this.country = obj?.name ?? '';
    this.iso = obj?.alpha2Code ?? '';
    this.currencyCode = obj?.currencyCode ?? '';
    this.code = obj?.callingCodes[0] ?? [];
    this.flags = {
      svg: obj?.flags?.svg ?? '',
      png: obj?.flags?.png ?? ''
    };
    this.independent = obj?.independent ?? false;
    this.stateProvinces = (obj?.stateProvinces ?? []).map((sp: any) => new StateProvince(sp));
    this.languages = (obj?.languages ?? []).map((lang: any) => new Language(lang));
  }
}
