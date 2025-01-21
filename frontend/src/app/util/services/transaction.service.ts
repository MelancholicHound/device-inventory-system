import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    private mimeMap: { [key: string]: string } = {
        '504b0304': 'application/zip',
        '25504446': 'application/pdf',
        'ffd8ffe0': 'image/jpeg',
        'ffd8ffe1': 'image/jpeg',
        'ffd8ffe2': 'image/jpeg',
        '89504e47': 'image/png',
        '47494638': 'image/gif',
        '504b0506': 'application/zip',
        '504b0708': 'application/zip',
    }

    constructor() { }

    detectMimeType(hexString: string): string | null {
        const magicNumber = hexString.slice(0, 8);
        return this.mimeMap[magicNumber] || null;
    }

    fileToHex(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event: ProgressEvent<FileReader>) => {
                const arrayBuffer = event?.target?.result as ArrayBuffer;
                const byteArray = new Uint8Array(arrayBuffer);
                let hexString = '';
                for (let i = 0; i < byteArray.length; i++) {
                    hexString += byteArray[i].toString(16).padStart(2, '0');
                }

                resolve(hexString);
            };

            reader.onerror = () => {
                reject('Error reading file');
            };

            reader.readAsArrayBuffer(file);
        });
    }

    hexToFile(hexString: string, fileName: string, mimeType: string): File {
        const byteArray = new Uint8Array(
            hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
        );

        const blob = new Blob([byteArray], { type: mimeType });

        return new File([blob], fileName, { type: mimeType });
    }
}
