export class Education {
  id: string;
  name: string;
  isActive: boolean;

  constructor(obj: any) {
    this.id = obj?.id ?? '';
    this.name = obj.name ?? null;
    this.isActive = obj?.isActive ?? false;
  }
}
