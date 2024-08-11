import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from '@app/app.config';
import { AppComponent } from '@app/app.component';
import Quill from "quill";
import BlotFormatter from "@enzedonline/quill-blot-formatter2";

Quill.register('modules/blotFormatter', BlotFormatter);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
