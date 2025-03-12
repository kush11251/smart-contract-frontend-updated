import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('../app/smrt/smrt.module').then(m => m.SmrtModule),
        data: {title: 'Smart Contract'}
    }
];
