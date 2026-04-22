declare module 'file-saver' {
  export function saveAs(data: Blob | File | any, filename?: string, disableAutoBOM?: boolean): void;
}
