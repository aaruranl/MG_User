export class Intent{
  publishableKey:string

  constructor(obj:any){
    this.publishableKey = obj.publishableKey ?? '';
  }
}
