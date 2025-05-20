interface ContactPersonDTO {
    name: string;
    phoneNumber: string;
}

export interface Supplier {
    id: number;
    name: string;
    location: string;
    contactNumber: string;
    emailAddress: string;
    contactPersonDTO: ContactPersonDTO;
}
