import {NgModule} from "@angular/core";
import {MatButtonModule} from "@angular/material/button";
import {MatListModule} from "@angular/material/list";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatTabsModule} from "@angular/material/tabs";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatDialogModule} from "@angular/material/dialog";
import {CdkTrapFocus} from "@angular/cdk/a11y";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatMenuModule} from "@angular/material/menu";
import {MatStepperModule} from "@angular/material/stepper";

@NgModule({
    imports: [
        CdkTrapFocus
    ],
    exports: [
        MatButtonModule,
        MatListModule,
        MatToolbarModule,
        MatIconModule,
        MatSidenavModule,
        MatTabsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatProgressBarModule,
        MatMenuModule,
        MatStepperModule,
        CdkTrapFocus
    ]
})
export class MaterialModule {}
