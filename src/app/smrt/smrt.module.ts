import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SmrtRoutingModule } from './smrt-routing.module';
import { LandingComponent } from './pages/landing/landing.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog'


@NgModule({
  declarations: [
    LandingComponent
  ],
  imports: [
    CommonModule,
    SmrtRoutingModule,

    FormsModule,
    ReactiveFormsModule,
    MatDialogModule
  ]
})
export class SmrtModule { }
