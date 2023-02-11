
export function humanFileSize(bytes: number) {
    if ( !bytes ) return '0 B';
    const k = 1024;
    const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const multiplier = Math.min(units.length-1,Math.floor(Math.log(bytes)/Math.log(k)));
    const precision = Math.min(2, multiplier*2);
    const value = bytes / (1024**multiplier);
    return value.toFixed(precision) + ' ' + units[multiplier];
}
