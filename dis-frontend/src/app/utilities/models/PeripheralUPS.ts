export interface PeripheralUPS {
    id: number;
    batchId: number;
    sectionId: number;
    peripheralIds: number[];
    serialNumber: string;
    brandId: number;
    model: string;
    kilovolts: number;
}
