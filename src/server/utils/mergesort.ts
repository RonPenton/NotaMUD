
export function mergesort<T>(values: T[], compareFn: (a: T, b: T) => number) {
    if (!values || values.length == 0)
        return;
    _mergeSort(values, values.slice(0), values.length, compareFn);
}

function _mergeSort<T>(values: T[], temp: T[], length: number, compareFn: (a: T, b: T) => number) {
    if (length == 1) return;
    var m = Math.floor(length / 2);
    var tmp_l = temp.slice(0, m);
    var tmp_r = temp.slice(m);
    _mergeSort(tmp_l, values.slice(0, m), m, compareFn);
    _mergeSort(tmp_r, values.slice(m), length - m, compareFn);
    _merge(tmp_l, tmp_r, values, compareFn);
}

function _merge<T>(left: T[], right: T[], values: T[], compareFn: (a: T, b: T) => number) {
    var a = 0;
    while (left.length && right.length) {
        values[a++] = compareFn(right[0], left[0]) < 0 ? right.shift()! : left.shift()!;
    }
    while (left.length) values[a++] = left.shift()!;
    while (right.length) values[a++] = right.shift()!;
}
