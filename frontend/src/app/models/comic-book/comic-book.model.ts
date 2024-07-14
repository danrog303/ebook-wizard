import EbookDownloadableResource from "../ebook/ebook-downloadable-resource.model";
import EbookFileLock from "../ebook/ebook-file-lock.model";

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
    editLock: EbookFileLock;
    downloadableFiles: EbookDownloadableResource[];
    chapters: ComicBookChapter[];
}

