import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import {CommonModule} from "@angular/common";
import MaterialModule from "@app/modules/material.module";
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.mjs';

@Component({
    selector: 'app-pdf-viewer',
    standalone: true,
    imports: [
        MaterialModule,
        CommonModule
    ],
    templateUrl: './pdf-viewer.component.html',
    styleUrl: './pdf-viewer.component.scss'
})
export class PdfViewerComponent implements OnInit, OnDestroy {
    @Input() url: string = "";
    @Input() cssHeight: string = "";
    @Input() cssWidth: string = "";

    currentPage: number = 1;
    private pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;
    private canChangePage: boolean = true;

    async ngOnInit() {
        await this.loadPdf(this.url);
        window.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    ngOnDestroy() {
        window.removeEventListener('keydown', this.onKeyDown.bind(this));
    }

    async loadPdf(url: string) {
        this.pdfDoc = await pdfjsLib.getDocument(url).promise;
        this.currentPage = 1;
        await this.renderPage(this.currentPage);
    }

    async goToPage(pageNumber: number) {
        if (!this.pdfDoc) {
            return;
        }

        if (pageNumber > 0 && pageNumber <= this.pdfDoc.numPages) {
            this.currentPage = pageNumber;
            await this.renderPage(pageNumber);
        }
    }

    getMaxPages() {
        if (!this.pdfDoc)
            return 0;
        return this.pdfDoc.numPages;
    }

    async getTextContent(pageNumber: number): Promise<string> {
        const page = await this.pdfDoc!.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const textItems = textContent.items;
        let pageText = '';
        textItems.forEach((item: any) => {
            pageText += item.str + ' ';
        });
        return pageText;
    }

    private async renderPage(pageNumber: number) {
        const page = await this.pdfDoc!.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.getElementById('pdfCanvas') as HTMLCanvasElement;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        await page.render(<any>renderContext).promise;
    }

    async onKeyDown(event: KeyboardEvent) {
        // When pages are being changed too fast (before the previous page render function finished),
        // PDF.js sometimes glitches and renders the page in a wrong position
        // this.canChangePage is used to prevent this from happening
        if (!this.canChangePage) {
            return;
        }

        if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            this.canChangePage = false;
            await this.goToPage(this.currentPage - 1);
            this.canChangePage = true;
        } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            this.canChangePage = false;
            await this.goToPage(this.currentPage + 1);
            this.canChangePage = true;
        }
    }
}
