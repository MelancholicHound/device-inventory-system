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
    cpuBrandId: number;
    cpuBrandSeriesId: number;
    cpuModifier: string;
}

interface DeviceSoftwareReq {
    operatingSystemid: number;
    productivityToolId: number;
    securityId: number;
}

export interface AIO {
    batchId: number;
    sectionId: number;
    upsId: number;
    peripheralIds: number[];
    storageRequests: StorageCap[];
    ramRequests: RamCap[];
    videoCardRequest: VideoCardCap;
    cpuRequest: CPUReq;
    brandId: number;
    deviceSoftwareRequest: DeviceSoftwareReq;
    connectionIds: number[];
    model: string;
}
