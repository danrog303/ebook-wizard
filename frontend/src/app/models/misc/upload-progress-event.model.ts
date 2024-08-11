export default interface UploadProgressEvent<T> {
    progress: number;
    result: T | null;
}
