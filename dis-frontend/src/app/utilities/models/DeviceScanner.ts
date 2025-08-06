export interface DeviceScanner {
  id: number;
  batch_id: number;
  section_id: number;
  serial_number: string;
  brand_id: number;
  model: string;
  type_id: number;
  accountable_user: string;
  co_accountable_user: string;
}
