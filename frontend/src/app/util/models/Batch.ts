interface PurchaseRequestDTO {
    number: number;
    file: File;
}

export interface Batch {
    id: number;
    validUntil: Date;
    dateDelivered: Date;
    dateTested: Date;
    supplierId: number;
    serviceCenter: string;
    purchaseRequestDTO: PurchaseRequestDTO;
}
