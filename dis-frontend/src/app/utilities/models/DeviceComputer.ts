interface StorageCap {
  capacity_id: number;
  type_id: number;
}

interface RamCap {
  capacity_id: number;
}

interface CPUReq {
  series_id: number;
  model: string
}

interface MotherboardReq {
  brand_id: number;
  model: string;
}


export interface DeviceComputer {
  id: number;
  batch_id: number;
  section_id: number;
  serial_number: string;
  ups_id: number;
  peripheralDTO: number[];
  storageDTO: StorageCap[];
  ramDTO: RamCap[];
  gpu_id: number;
  processorDTO: CPUReq;
  brandId: number;
  os_id: number;
  prod_id: number;
  security_id: number;
  connectionDTO: number[];
  motherboardDTO: MotherboardReq;
}
