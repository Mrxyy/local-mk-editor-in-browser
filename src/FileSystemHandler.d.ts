interface FileSystemHandlePermissionDescriptor {
    mode: 'read' | 'readwrite'
}

interface FileSystemWritableFileStream extends WritableStream, WritableStreamDefaultWriter {

}

interface FileSystemHandle {
    kind: 'file' | 'directory'
    name: string
    isSameEntry: (handler: FileSystemHandle) => boolean
    queryPermission: (descriptor: FileSystemHandlePermissionDescriptor) => Promise<PermissionState>
    requestPermission: (descriptor: FileSystemHandlePermissionDescriptor) => Promise<PermissionState>
}

interface FileSystemFileHandle extends FileSystemHandle {
    getFile: () => Promise<File>
    createWritable: () => Promise<FileSystemWritableFileStream>
}


interface FileSystemDirectoryHandle extends FileSystemHandle {
    values: () => AsyncIterator<FileSystemHandle, any, any>
    keys: () => AsyncIterator<string, any, any>
    entries: () => AsyncIterator<Array<string | FileSystemHandle>, any, any> //length 2 array
    getFileHandle: (name: string, option: { create: boolean }) => Promise<FileSystemFileHandle>
    getDirectoryHandle: (name: string, option: { create: boolean }) => Promise<FileSystemDirectoryHandle>
    removeEntry: (name: string, options: { recursive: boolean }) => Promise<undefined>
    resolve: (name: string) => Promise<Array<string>> //return path
}