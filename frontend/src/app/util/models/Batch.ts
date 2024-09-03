export interface Batch {
    batchId: number;
    validUntil: Date;
    dateDelivered: Date;
    dateTested: Date;
    supplierId: number;
    serviceCenter: string;
}
