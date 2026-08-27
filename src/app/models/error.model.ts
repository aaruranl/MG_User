export class Error {
  title:string;
  details:string;
  statusCode;

  constructor(obj:any){
    this.title = obj.title ?? 'unknown error';
    this.details = obj.title ?? 'unknown details';
    this.statusCode = obj.title ?? '166';
  }
}
