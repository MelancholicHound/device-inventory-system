import { Component, ViewChild, ElementRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormGroup, Validators, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';

import { AuthService } from '../../util/services/auth.service';
import { NotificationService } from '../../util/services/notification.service';

@Component({
    selector: 'app-navigation',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule
    ],
    templateUrl: './navigation.component.html',
    styleUrl: './navigation.component.scss'
})

export class NavigationComponent implements OnInit {
    @ViewChild('batchDelivery') batchDelivery!: ElementRef<HTMLButtonElement>;
    @ViewChild('computerInventory') computerInventory!: ElementRef<HTMLButtonElement>;

    authService = inject(AuthService);
    notification = inject(NotificationService);

    userDetails: any; positions: any;
    isEditing: boolean = false;
    userForm!: FormGroup;

    constructor(private router: Router) { }

    ngOnInit(): void {
        const token = localStorage.getItem('token');
        this.userForm = this.createUserFormGroup();
        this.userForm.disable();

        if (token) {
            this.authService.getByEmail(this.extractEmail(token)).subscribe({
                next: (res: any) => {
                    this.userDetails = res;
                    this.userForm.patchValue(res);
                    this.userForm.get('positionId')?.setValue(res.positionDTO.id);
                },
                error: (error: any) => this.notification.showError(error)
            });
        }

        this.authService.getEmployeePositions().subscribe({
            next: (res: any) => this.positions = res,
            error: (error: any) => this.notification.showError(error)
        });
    }

    private extractEmail (token: any) {
        const tokenPayload = token.split(".")[1];
        const decodedPayload = atob(tokenPayload);
        const payloadData = JSON.parse(decodedPayload);

        return payloadData.sub;
    }

    createUserFormGroup(): FormGroup {
        return new FormGroup({
            firstName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
            middleName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
            lastName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
            positionId: new FormControl('', [Validators.required]),
            positionRanking: new FormControl('', [Validators.required]),
            email: new FormControl('', [Validators.required, Validators.email])
        });
    }

    navigateBatchDelivery() {
        this.batchDelivery.nativeElement.classList.add('active');
        this.computerInventory.nativeElement.classList.remove('active');
        this.router.navigate(['batch-delivery']);
    }

    navigateComputerInventory() {
        this.batchDelivery.nativeElement.classList.remove('active');
        this.computerInventory.nativeElement.classList.add('active');
        this.router.navigate(['computer-inventory']);
    }

    logOut(): void {
        localStorage.removeItem('token');
    }
}
