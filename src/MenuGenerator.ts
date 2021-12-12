interface MenuGeneratorInterface {
    id?: string;
    name: string;
    expand?: boolean;
    children?: Array<MenuGenerator> | undefined | [];
    entryHandler?: FileSystemHandle;
    parent?: MenuGenerator;
}

export class MenuGenerator implements MenuGeneratorInterface {
    id?: string = ''
    name: string = ''
    expand?: boolean = false
    children?: Array<MenuGenerator> | undefined | [] = []
    entryHandler?: FileSystemHandle = undefined
    parent?: MenuGenerator = undefined
    constructor({
        id,
        name,
        expand,
        children,
        entryHandler,
        parent,
    }: MenuGenerator) {
        this.id = id;
        this.name = name;
        this.expand = expand;
        this.children = children;
        this.entryHandler = entryHandler;
        this.parent = parent;
    }
}

function isFileSystemEntry(obj: { [key: string]: any }): obj is FileSystemEntry {
    return !!obj.filesystem
}

function FileSystemEntryToFileSystemHandler(entry: FileSystemEntry): FileSystemHandle {
    const { isDirectory, isFile, name } = entry
    const proptype: FileSystemHandle = {
        kind: (isDirectory && "directory") || "file",
        name: name,
        isSameEntry(entry: FileSystemHandle): boolean {
            return this === entry
        },
        async queryPermission(descriptor: FileSystemHandlePermissionDescriptor): Promise<PermissionState> {
            navigator.PersistentStorage = navigator.PersistentStorage || navigator.webkitPersistentStorage
            const result: PermissionState = await new Promise((resolve, reject) => {
                navigator.webkitPersistentStorage.queryUsageAndQuota(
                    (usedBytes: number, grantedBytes: number) => {
                        if (grantedBytes < 100) {
                            resolve("prompt");
                        }
                        resolve("granted");
                    },
                    () => {
                        resolve("denied")
                    }
                )
            });
            return result;
        },
        async requestPermission(descriptor: FileSystemHandlePermissionDescriptor): Promise<PermissionState> {
            navigator.PersistentStorage = navigator.PersistentStorage || navigator.webkitPersistentStorage
            var requestedBytes = 1024 * 1024 * 100; // 100MB
            const result: PermissionState = await new Promise((resolve, reject) => {
                const errFx = () => {
                    resolve("denied")
                }
                navigator.PersistentStorage.requestQuota(
                    requestedBytes,
                    (grentedSzie: number) => {
                        webkitRequestFileSystem(
                            PERSISTENT,
                            grentedSzie / 2,
                            (fs: FileSystem) => {
                                resolve("granted");
                            },
                            errFx
                        );
                    },
                    errFx
                );
            })
            return result
        }
    }
    const handler: FileSystemHandle = Object.create(proptype);
    if (isFile) {
        Object.assign(handler, {
            async getFile(): Promise<File> {
                return await new Promise((resolve, reject) => {
                    (entry as FileSystemFileEntry).file((file: File) => {
                        resolve(file)
                    }, reject)
                })
            },
            async createWritable(): Promise<FileSystemWritableFileStream> {
                return await new Promise((resolve, reject) => {
                    (entry as FileSystemFileEntry).createWriter((writer: FileWriter) => {
                        resolve(writer as FileSystemWritableFileStream)
                    }, reject)
                })
            }

        })
    }
    if (isDirectory) {
        async function* Generator(resultHandler: (entry: FileSystemEntry) => any): AsyncGenerator<(string | FileSystemHandle)[], any, any> {
            let index = 0;
            let done = false;
            while (!done) {
                yield await new Promise<Array<string | FileSystemHandle>>((resolve, reject) => {
                    (entry as FileSystemDirectoryEntry).createReader().readEntries((entry: Array<FileSystemEntry>) => {
                        if (index === entry.length) {
                            done = true
                            return undefined
                        }
                        resolve(resultHandler(entry[index]))
                        index++
                    }, reject)
                });
            }
        }
        Object.assign(handler, {
            async kvalueseys() {
                return Generator((entry) => FileSystemEntryToFileSystemHandler(entry));
            },
            async keys() {
                return Generator((entry) => entry.name);
            },
            entries(): AsyncIterator<Array<string | FileSystemHandle>, any, any> {
                return Generator((entry) => [entry.name, FileSystemEntryToFileSystemHandler(entry)]);
            },
            getFileHandle(name: string, option: { create: boolean }): Promise<FileSystemDirectoryHandle> {
                return new Promise((resolve, reject) => {
                    (entry as FileSystemDirectoryEntry).getFile(name, Object.assign(option, { exclusive: true }), (fileEntry) => {
                        resolve(FileSystemEntryToFileSystemHandler(fileEntry) as FileSystemDirectoryHandle);
                    }, reject);
                })
            },
            getDirectoryHandle(name: string, option: { create: boolean }): Promise<FileSystemDirectoryHandle> {
                return new Promise((resolve, reject) => {
                    (entry as FileSystemDirectoryEntry).getDirectory(name, Object.assign(option, { exclusive: true }), (dirEntry: FileSystemEntry) => {
                        resolve(FileSystemEntryToFileSystemHandler(dirEntry) as FileSystemDirectoryHandle);
                    }, reject);
                })
            },
            removeEntry(name: string, options: { recursive: boolean }) {
                return new Promise((resolve, reject) => {
                    (entry as FileSystemDirectoryEntry).createReader().readEntries((entry: Array<FileSystemEntry>) => {
                        entry.find((entryItem) => {
                            if (entryItem.name === name) {
                                if (options.recursive && entryItem.isDirectory) {
                                    (entryItem as FileSystemDirectoryEntry).removeRecursively(resolve, reject)
                                } else {
                                    entryItem.remove(resolve, reject);
                                }
                            }
                            return entryItem.name === name
                        })
                    }, reject)
                })
            },
            async resolve(name: string): Promise<Array<string>> {
                const result = entry.fullPath.split(",");
                result[0] = "/"
                return result
            }
        })
    }
    return handler;
}

export function getParamFromEntry(
    handler: FileSystemHandle | FileSystemEntry,
    parent?: MenuGenerator
): MenuGenerator {
    if (isFileSystemEntry(handler)) {
        handler = FileSystemEntryToFileSystemHandler(handler)
    }
    return {
        id: handler.name,
        name: handler.name || "FileSystem",
        expand: false,
        children: handler.kind != "file" ? [] : undefined,
        entryHandler: handler,
        parent: parent,
    };
}