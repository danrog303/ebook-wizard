import EbookDownloadableResource from "../ebook/ebook-downloadable-resource.model";
import EbookFormat from "../ebook/ebook-format.enum";
import EbookFileLock from "../ebook/ebook-file-lock.model";

interface EbookFile {
    id?: string;
    ownerUserId?: string;
    name: string;
    author: string;
    description: string;
    containerName: string;
    coverImageKey?: string;
    tags: string[];
    creationDate?: Date;
    favorite: boolean;
    isPublic: boolean;
    conversionSourceFormat?: EbookFormat;
    editLock?: EbookFileLock;
    downloadableFiles?: EbookDownloadableResource[];
}

export default EbookFile;
