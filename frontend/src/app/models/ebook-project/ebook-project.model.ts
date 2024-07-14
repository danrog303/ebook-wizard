import EbookDownloadableResource from "../ebook/ebook-downloadable-resource.model";
import EbookFileLock from "../ebook/ebook-file-lock.model";
import EbookProjectIllustration from "./ebook-project-illustration.model";
import EbookProjectChapter from "./ebook-project-chapter.model";

interface EbookProject {
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

export default EbookProject;
