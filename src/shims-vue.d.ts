interface Window {
  [properties: string]: any
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare const PERSISTENT: Number;
declare const TEMPORARY: Number;

declare module 'codemirror';
declare module "@kangc*";

type FileSystemHandle = any;