export class SubCommunity {
  id: string;
  name: string;
  isActive: boolean;

  constructor(obj: any) {
    this.id = obj?.id ?? '';
    this.name = obj?.name ?? 'Unnamed SubCommunity';
    this.isActive = obj?.isActive ?? false;
  }
}

export class Community {
  id: string;
  name: string;
  isActive: boolean;
  subCommunities: SubCommunity[];

  constructor(obj: any) {
    this.id = obj.id ?? '';
    this.name = obj.name ?? 'Unnamed Community';
    this.isActive = obj.isActive ?? false;
    this.subCommunities = Array.isArray(obj?.subCommunities)
      ? obj.subCommunities.map((sub: any) => new SubCommunity(sub))
      : [];
  }
}
