import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements OnInit {
  userForm: FormGroup;
  isLoading = false;
  buttonText: string = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dob: ['', Validators.required],
      pan: [
        '',
        [Validators.required, Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')],
      ],
      gender: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('[0-9]{6}')]],
      loanType: ['', Validators.required],
      loanAmount: ['', Validators.required],
      loanTenure: ['', Validators.required],
      consent: [false, Validators.requiredTrue],
      consent2: [false],
    });
  }

  ngOnInit(): void {
    if (localStorage.getItem('txKey')) {
      console.log(localStorage.getItem('txKey'))

      this.apiService
        .getDigiData(localStorage.getItem('txKey')?.toString)
        .subscribe((res) => {
          console.log(res);
        });
    }
  }

  calculateEMI(loanAmount: number, loanTenure: number, roi: number): number {
    const monthlyRate = roi / 12 / 100;
    const tenureMonths = loanTenure * 12;
    return (
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1)
    );
  }

  dummySubmit() {
    this.apiService.getDigiUrl().subscribe((res: any) => {
      console.log(res);

      localStorage.setItem('txKey', res.decentroTxnId);

      window.open(res.data.authorizationUrl, '_blank');
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.isLoading = true;

      this.buttonText = 'Loading...';

      console.log('Form Submitted:', this.userForm.value);

      if (this.userForm.get('consent2')?.value) {
        const loanAmount = this.userForm.get('loanAmount')?.value;
        const loanTenure = parseInt(this.userForm.get('loanTenure')?.value);
        let roi = 0;

        if (loanAmount >= 100000 && loanAmount <= 1000000) {
          roi = 12;
        } else if (loanAmount > 1000000) {
          roi = 10;
        } else {
          roi = 13;
        }

        const emiAmount = this.calculateEMI(
          loanAmount,
          loanTenure,
          roi
        ).toFixed(2);

        let req = {
          firstName: this.userForm.get('firstName')?.value,
          middleName: this.userForm.get('middleName')?.value,
          lastName: this.userForm.get('lastName')?.value,
          dob: this.userForm.get('dob')?.value,
          pan: this.userForm.get('pan')?.value,
          gender: this.userForm.get('gender')?.value,
          pincode: this.userForm.get('pincode')?.value,
          loanType: this.userForm.get('loanType')?.value,
          loanAmount: loanAmount.toString(),
          loanTenure: loanTenure.toString(),
          roi: roi.toString(),
          emiAmount: emiAmount,
          consentFlag: true,
        };

        this.apiService.generateContract(req).subscribe((res: any) => {
          console.log(res);

          // prompt(res.toString())

          if (res?.status == '2001') {
            this.buttonText = 'Uploading File...';

            this.apiService
              .getFileData(res?.transactionId)
              .subscribe((file_res: any) => {
                console.log(file_res);

                if (file_res?.status == '2001') {
                  this.buttonText = 'Sending Mail...';

                  let mailReq = {
                    email: this.userForm.get('email')?.value,
                    link:
                      'https://gateway.pinata.cloud/ipfs/' + file_res?.fileHash,
                    name: this.userForm.get('firstName')?.value,
                  };

                  this.apiService
                    .sendMail(mailReq)
                    .subscribe((email_res: any) => {
                      if (email_res?.status == '2001') {
                        this.isLoading = false;

                        this.openDialog();
                      } else {
                        this.openErrorDialog;
                      }
                    });
                } else {
                  this.openErrorDialog();
                }
              });
          } else {
            this.openErrorDialog();
          }
        });
      } else {
        // this.apiService.uploadFileToPinata()
      }
    } else {
      const invalidFields = [];
      for (const control in this.userForm.controls) {
        if (this.userForm.controls[control].invalid) {
          invalidFields.push(control);
        }
      }
      console.log('Form is invalid. Invalid fields:', invalidFields.join(', '));
    }
  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogContent);

    dialogRef.afterClosed().subscribe(() => {
      this.userForm.reset(); // Ensure this method exists in your form
    });
  }

  openErrorDialog() {
    const dialogRef = this.dialog.open(ErrorDialogContent);

    dialogRef.afterClosed().subscribe(() => {
      this.userForm.reset(); // Ensure this method exists in your form
    });
  }
}

@Component({
  selector: 'dialog-content',
  template: `
    <div class="p-6 bg-white rounded-lg shadow-lg text-center">
      <h2 class="text-xl font-semibold text-gray-800 mb-2">Email Sent</h2>
      <p class="text-gray-600 mb-4">
        A mail has been sent to the entered email address.
      </p>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        (click)="onClose()"
      >
        OK
      </button>
    </div>
  `,
})
export class DialogContent {
  constructor(private dialogRef: MatDialogRef<DialogContent>) {}

  onClose() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'error-dialog-content',
  template: `
    <div class="p-6 bg-white rounded-lg shadow-lg text-center">
      <h2 class="text-xl font-semibold text-gray-800 mb-2">Error Occured</h2>
      <p class="text-gray-600 mb-4">We are working on it. Try Again Later</p>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        (click)="onClose()"
      >
        OK
      </button>
    </div>
  `,
})
export class ErrorDialogContent {
  constructor(private dialogRef: MatDialogRef<ErrorDialogContent>) {}

  onClose() {
    this.dialogRef.close();
  }
}
