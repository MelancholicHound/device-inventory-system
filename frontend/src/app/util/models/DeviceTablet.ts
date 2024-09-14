interface ChipsetReq {
    brandId: number;
    chipsetModel: string;
}

export interface Tablet {
    batchId: number;
    sectionId: number;
    upsId: number;
    peripheralsIds: number[];
    brandId: number;
    brandSeries: string;
    chipsetRequest: ChipsetReq;
    ramIds: number[];
    screenSize: string;
    storageIds: number[];
    connectionIds: number[];
}
