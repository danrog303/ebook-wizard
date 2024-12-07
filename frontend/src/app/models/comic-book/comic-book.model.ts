import EbookDownloadableResource from "../ebook/ebook-downloadable-resource.model";
import EbookEditLock from "../ebook/ebook-file-lock.model";

interface ComicBook {
    id: string;
    ownerUserId: string;
    name: string;
    writerName?: string;
    description?: string;
    coverImageKey: string;
    genre?: string;
    creationDate: string;
    isPublic: boolean;
    isManga: boolean;
    editLock: EbookEditLock;
    downloadableFiles: EbookDownloadableResource[];
    chapters: ComicBookChapter[];
}

