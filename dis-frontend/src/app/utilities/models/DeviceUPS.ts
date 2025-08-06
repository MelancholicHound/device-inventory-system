export interface DeviceUPS {
  id: number;
  batch_id: number;
  section_id: number;
  serial_number: string;
  brand_id: number;
  model: string;
  volt_amperes: number;
  accountable_user: string;
  co_accountable_user: string;
}
