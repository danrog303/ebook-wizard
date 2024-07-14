import EbookFormat from "./ebook-format.enum";

interface EbookDownloadableResource {
    stub: string;
    format: EbookFormat;
    creationDate: Date;
    fileKey: string;
}

export default EbookDownloadableResource;
