import EbookDownloadableResource from "../ebook/ebook-downloadable-resource.model";
import EbookFormat from "../ebook/ebook-format.enum";
import EbookFileLock from "../ebook/ebook-file-lock.model";

export default interface EbookFile {
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
    public: boolean;
    conversionSourceFormat?: EbookFormat;
    editLock?: EbookFileLock;
    downloadableFiles?: EbookDownloadableResource[];
}

export function createEmptyEbookFile(): EbookFile {
    return {
        id: "",
        name: "",
        author: "",
        description: "",
        tags: [],
        containerName: "",
        favorite: false,
        public: false
    };
}
