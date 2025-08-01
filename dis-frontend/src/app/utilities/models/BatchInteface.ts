interface PurchaseRequestDTO {
    number: number;
    file: File;
}

export interface BatchInterface {
    id: number;
    batch_id: string;
    valid_until: Date;
    date_delivered: Date;
    date_tested: Date;
    supplier_id: number;
    service_center: string;
    prDTO: PurchaseRequestDTO;
    created_by: number;
    created_at: Date;
}
