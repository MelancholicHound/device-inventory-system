interface StorageCap {
    capacityId: number;
    type: string;
}

interface RamCap {
    capacityId: number;
}

interface VideoCardCap {
    capacityId: number;
}

interface CPUReq {
    couBrandId: number;
    cpuBrandSeriesId: number;
    cpuModifier: string;
}

interface DeviceSoftwareReq {
    operatingSystemId: number;
    productivityToolId: number;
    securityId: number;
}

export interface Laptop {
    batchId: number;
    sectionId: number;
    upsId: number;
    peripheralsIds: number[];
    storageRequests: StorageCap[];
    ramRequests: RamCap[];
    videoCardRequest: VideoCardCap;
    cpuRequest: CPUReq;
    brandId: number;
    deviceSoftwareRequst: DeviceSoftwareReq;
    connectionIds: number[];
    model: string;
    screenSizeByInches: number;
}
