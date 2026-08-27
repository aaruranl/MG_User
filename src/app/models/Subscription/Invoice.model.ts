export class Invoice {
  invoiceId: string;
  planName: string;
  invoiceDate: Date | null;
  amount: number;
  status: string;

  constructor(data: any) {
    this.invoiceId = data.invoiceId ?? '';
    this.planName = data.planName ?? '';
    this.invoiceDate = data.invoiceDate ? new Date(data.invoiceDate) : null;
    this.amount = data.amount ?? 0;
    this.status = data.status ?? '';
  }
}
