interface ChipsetReq {
  brand_id: number;
  model: string;
}

export interface DeviceTablet {
  batch_id: number;
  section_id: number;
  serial_number: string;
  ups_id: number;
  peripheralDTO: number[];
  brand_id: number;
  model: string;
  chipsetDTO: ChipsetReq;
  ram_capacity_id: number;
  storage_capacity_id: number;
  connectionDTO: number[];
  accountable_user: string;
  co_accountable_user: string;
}
