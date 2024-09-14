interface StorageCap {
    capacityId: number;
    type: string;
}

interface RamCap {
    capacityId: number;
}

interface VideoCardCap {
    capacityid: number;
}

interface CPUReq {
    cpuBrandId: number;
    cpuBrandSeriesId: number;
    cpuModifier: string;
}

interface DeviceSoftwareReq {
    operatingSystemId: number;
    productivityToolId: number;
    securityId: number;
}

interface MotherboardReq {
    motherBoardBrandId: number;
    motherBoardModel: string;
}


export interface Computer {
    batchId: number;
    sectionId: number;
    upsId: number;
    peripheralsIds: number[];
    storageRequests: StorageCap[];
    ramRequests: RamCap[];
    videoCardRequest: VideoCardCap;
    cpuRequest: CPUReq;
    brandId: number;
    deviceSoftwareRequest: DeviceSoftwareReq;
    connectionIds: number[];
    motherBoardRequest: MotherboardReq;
}
