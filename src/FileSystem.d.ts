declare interface FileSystemEntry{

}


declare interface FileSystemDirectoryEntry extends FileSystemEntry{
    name:string;
    root:FileSystemDirectoryEntry
}