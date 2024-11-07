export default interface EbookFileBookmark {
    id?: string;
    ebookFileId: string;
    userId?: string;
    bookmarkedPages: number[];
}
