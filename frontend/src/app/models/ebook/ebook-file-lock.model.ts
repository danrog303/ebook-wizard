interface EbookFileLock {
    isLocked: boolean;
    lockExpirationDate?: Date;
}

export default EbookFileLock;
