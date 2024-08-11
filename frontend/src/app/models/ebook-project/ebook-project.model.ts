import EbookDownloadableResource from "../ebook/ebook-downloadable-resource.model";
import EbookFileLock from "../ebook/ebook-file-lock.model";
import EbookProjectIllustration from "./ebook-project-illustration.model";
import EbookProjectChapter from "./ebook-project-chapter.model";

export default interface EbookProject {
    id: string;
    ownerUserId: string;
    name: string;
    author?: string;
    description?: string;
    containerName?: string;
    coverImageKey?: string;
    tags: string[];
    creationDate: Date;
    isPublic: boolean;
    lock: EbookFileLock;
    illustrations: EbookProjectIllustration[];
    downloadableFiles: EbookDownloadableResource[];
    chapters: EbookProjectChapter[];
}

export function createEmptyEbookProject(): EbookProject {
    return {
        id: "",
        ownerUserId: "",
        name: "",
        author: "",
        description: "",
        containerName: "",
        coverImageKey: "",
        tags: [],
        creationDate: new Date(),
        isPublic: false,
        lock: {
            isLocked: false,
            lockExpirationDate: new Date(),
        },
        illustrations: [],
        downloadableFiles: [],
        chapters: []
    };
}
