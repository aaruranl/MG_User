export class TokenResult {
  token: string;
  tokenType: number;
  isError:boolean;
  error:Error | null;
  constructor(obj:any){
    this.token = obj.token ?? '';
    this.tokenType = obj.tokenType ?? 0;
    this.isError = obj.IsError ?? false;
    this.error = obj.Error !== null ? new Error(obj.Error) : null ;
  }
}
