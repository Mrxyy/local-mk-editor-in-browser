interface FileWriter extends WritableStreamDefaultWriter {

}
interface FileSystemFileEntry {
    createWriter: (successFX?: (writer: FileWriter) => any, error?: (err: Error) => any)
}