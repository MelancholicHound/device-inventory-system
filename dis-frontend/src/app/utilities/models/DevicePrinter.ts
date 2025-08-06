export interface DevicePrinter {
  id: number;
  batch_id: number;
  section_id: number;
  serial_number: string;
  brand_id: number;
  model: string;
  type_id: number;
  with_scanner: boolean;
  accountable_user: string;
  co_accountable_user: string;
}
