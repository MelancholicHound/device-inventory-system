export interface TableBatchInterface {
  id: number;
  batch_id: string;
  supplier_id: number;
  date_delivered: Date;
  valid_until: Date;
  created_at: Date;
}
