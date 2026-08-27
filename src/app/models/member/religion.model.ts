export class Religion {
  id: string;
  name: string;
  isActive: boolean;

  constructor(obj: any) {
    this.id = obj?.id ?? '';
    this.name = obj.name ?? 'Unnamed Community';
    this.isActive = obj?.isActive ?? false;
  }
}
