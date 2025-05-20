import { signal, computed } from '@angular/core';
import { FormGroup } from '@angular/forms';

export interface Column {
    field: string;
    header: string;
}

export class PasswordMatchModel {
    password = signal('');
    confirmPassword = signal('');

    passwordsMatch = computed(() =>
        this.password() === this.confirmPassword() && this.confirmPassword() !== ''
    );

    formBinding(form: FormGroup) {
        form.get('password')?.valueChanges.subscribe(value => this.password.set(value));
        form.get('confirmPassword')?.valueChanges.subscribe(value => this.confirmPassword.set(value));
    }
}

export class FileConverter {
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
            }

            reader.onerror = () => {
                reject('Error reading file.');
            }

            reader.readAsArrayBuffer(file);
        });
    }

    hexToFile(hexString: string, mimeType: any) {
        const byteArray = new Uint8Array(
            hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
        );

        const blob = new Blob([byteArray], { type: mimeType });
        const url = URL.createObjectURL(blob);

        return url;
    }
}

export class TableUtilities {
    pageChange(event: any) {
        return event.first;
    }

    sortTableData(event: any) {
        event.data?.sort((data1: any, data2: any) => {
            let value1 = data1[event.field];
            let value2 = data2[event.field];
            let result: any;

            if (value1 == null && value2 != null) result = -1;
            else if (value1 != null && value2 == null) result = 1;
            else if (value1 == null && value2 == null) result = 0;
            else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
            else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

            return event.order * result;
        });
    }
}

export class BatchContainer {
    batchDetails = signal([]);
}
