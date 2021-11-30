export function errorHandler(e: Error) {
    console.error("错误发生", e);
}

export function getfileSystemDirctroy(
    fs: FileSystem,
    path: string,
    fx: (fileEntry: FileSystemEntry) => any,
    flag: FileSystemFlags = {}
) {
    fs.root.getDirectory(path, flag, fx, (e: Error) => {
        // 如果没有就新建一个
        getfileSystemDirctroy(fs, path, fx, {
            create: true,
            exclusive: true,
        });
    });
}