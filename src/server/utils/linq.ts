import { isString, Func1, Func2, Action2, tuple } from "./index";

export interface Bifurcation<T> {
    trueValues: LinqContainer<T>;
    falseValues: LinqContainer<T>;
}
export function Linq<T>(array: Iterable<T>): LinqContainer<T> {
    return new LinqContainer(array);
}
export function L<T>(array: Iterable<T>): LinqContainer<T> {
    return new LinqContainer(array);
}
export function In<T>(item: T, ...args: T[]) {
    return Linq(args).areAny(x => x == item);
}

export class LinqContainer<T> implements Iterable<T> {
    constructor(public values: Iterable<T>) {
        if (this.values == null)
            this.values = [];
    }

    [Symbol.iterator](): Iterator<T> {
        return this.values[Symbol.iterator]();
    }

    public first(predicate?: Func1<T, boolean>): T {
        var x = this.firstOrDefault(predicate);
        if (x)
            return x;
        throw Error("No matches.");
    }

    public firstOrDefault(predicate?: Func1<T, boolean>): T | null {
        if (!predicate) {
            return this.values[Symbol.iterator]().next().value;
        }
        for (let x of this.values) {
            if (predicate(x))
                return x;
        }
        return null;
    }

    public last(predicate?: Func1<T, boolean>): T {
        var x = this.lastOrDefault(predicate);
        if (x)
            return x;
        throw Error("No matches.");
    }

    public lastOrDefault(predicate?: Func1<T, boolean>): T | null {
        let array = this.toArray();
        if (!predicate) {
            return array[array.length - 1];
        }

        for (var i = array.length - 1; i >= 0; i--) {
            if (predicate(array[i]))
                return array[i];
        }
        return null;
    }

    public distinct<U>(picker?: Func1<T, U>): LinqContainer<T> {
        if (picker == undefined) {
            picker = x => <U><any>x;
        }
        var s: Set<U> = new Set<U>();
        var output: T[] = [];
        for (let x of this.values) {
            var k = picker(x);
            if (s.has(k))
                continue;
            s.add(k);
            output.push(x);
        }
        return new LinqContainer(output);
    }

    public isInOrder(picker: Func1<T, any>): boolean {
        var started = false;
        var last: any;
        for (let x of this.values) {
            if (!started) {
                last = picker(x);
                started = true;
                continue;
            }
            var next = picker(x);
            if (LinqContainer._ascendingCompare(last, next) > 0)
                return false;
            last = next;
        }
        return true;
    }

    public orderBy(picker: Func1<T, any>, thenBy?: Func1<T, any>[]): LinqContainer<T> {
        return this._orderBy(picker, thenBy, LinqContainer._ascendingCompare);
    }

    public orderByStable(picker: Func1<T, any>): LinqContainer<T> {
        return this._orderBy(picker, [], LinqContainer._ascendingCompare);
    }

    public orderByDescending(picker: Func1<T, any>, thenBy?: Func1<T, any>[]): LinqContainer<T> {
        return this._orderBy(picker, thenBy, LinqContainer._descendingCompare);
    }

    public orderByDescendingStable(picker: Func1<T, any>): LinqContainer<T> {
        return this._orderBy(picker, [], LinqContainer._descendingCompare);
    }

    private _orderBy(picker: Func1<T, any>, thenBy: Func1<T, any>[] | undefined, comparer: Func2<any, any, number>): LinqContainer<T> {
        var clone = this.clone();

        if (thenBy === undefined) {
            clone.sort(LinqContainer._pickerCompare(picker, comparer));
        }
        else {
            // ThenBy clause specified. Switch to a stable sort to preserve the order on multiple passes.
            thenBy.unshift(picker);
            for (var i = thenBy.length - 1; i >= 0; i--) {
                MergeSort.run(clone, LinqContainer._pickerCompare(thenBy[i], comparer));
            }
        }
        return new LinqContainer(clone);
    }

    public groupBy<K>(picker: Func1<T, K>): LinqContainer<Grouping<T, K>> {
        var groups: Map<K, T[]> = new Map<K, T[]>();
        for (let x of this.values) {
            let key = picker(x);
            var group: T[];
            if (!groups.has(key)) {
                groups.set(key, group = []);
            }
            else {
                group = groups.get(key) || [];
            }
            group.push(x);
        }
        var output: Grouping<T, K>[] = [];
        for (var [key, value] of groups) {
            output.push(new Grouping<T, K>(key, value));
        }

        return new LinqContainer(output);
    }

    public areAny(predicate?: Func1<T, boolean>): boolean {
        if (predicate) {
            for (let x of this.values) {
                if (predicate(x))
                    return true;
            }
            return false;
        }
        else {
            return !this.values[Symbol.iterator]().next().done;
        }
    }

    public none(predicate?: Func1<T, boolean>): boolean {
        return !this.areAny(predicate);
    }

    public all(predicate: Func1<T, boolean>): boolean {
        for (let x of this.values) {
            if (!predicate(x))
                return false;
        }
        return true;
    }

    public reverse(): LinqContainer<T> {
        return Linq(this.clone().reverse());
    }

    public shuffle(): LinqContainer<T> {
        var newValues: T[] = [];
        var clone = this.clone();
        while (clone.length > 0) {
            var index = (Math.random() * clone.length) | 0;
            newValues.push(clone.splice(index, 1)[0]);
        }
        return Linq(newValues);
    }

    public static sequence(length: number): LinqContainer<number> {
        var array: number[] = [];
        for (var i = 0; i < length; i++)
            array.push(i);
        return Linq(array);
    }

    /**
        * Performs a left join on two arrays, returning only the records in the first array which match the predicate.
        *   * - Technically a left join should return the records in the second array as well, but for optimization purposes
        *       that step has been left out because this is more useful in this context.
        */
    public partialLeftJoin<U>(other: U[], predicate: Func2<T, U, boolean>): LinqContainer<T> {
        var x = this.toArray().filter(x => Linq(other).areAny(y => predicate(x, y)));
        return new LinqContainer(x);
    }

    public where(predicate: Func1<T, boolean>): LinqContainer<T> {
        return new LinqContainer(this.toArray().filter(predicate));
    }

    public bifurcate(predicate: Func1<T, boolean>): Bifurcation<T> {
        var trueValues: T[] = [];
        var falseValues: T[] = [];
        this.forEach(x => {
            if (predicate(x))
                trueValues.push(x);
            else
                falseValues.push(x);
        });

        return { trueValues: Linq(trueValues), falseValues: Linq(falseValues) };
    }

    public select<U>(predicate: Func1<T, U>): LinqContainer<U> {
        return new LinqContainer(this.toArray().map(predicate));
    }

    public take(amount: number): LinqContainer<T> {
        var array = this._asArray();
        if (array)
            return Linq(this.toArray().slice(0, amount));
        else {
            var values: T[] = [];
            var i = 0;
            for (let x of this.values) {
                if (i < amount)
                    values.push(x);
                else
                    break;
                i++;
            }
            return Linq(values);
        }
    }

    public skip(amount: number): LinqContainer<T> {
        var array = this._asArray();
        if (array)
            return Linq(this.toArray().slice(amount));
        else {
            var values: T[] = [];
            var i = 0;
            for (let x of this.values) {
                if (i >= amount)
                    values.push(x);
                i++;
            }
            return Linq(values);
        }
    }

    public union(other: Iterable<T>): LinqContainer<T> {
        var array = this.clone();
        for (let x of other)
            array.push(x);
        return Linq(array);
    }

    public except(predicate: Func1<T, boolean>): LinqContainer<T> {
        return this.where(x => !predicate(x));
    }

    public firstIndexOf(predicate: Func1<T, boolean>): number {
        var i = 0;
        for (let x of this.values) {
            if (predicate(x))
                return i;
            i++;
        }
        return -1;
    }

    public static multiUnion<T>(containers: LinqContainer<Iterable<T>>): LinqContainer<T> {
        var array = containers.toArray();
        var running: T[] = [];
        for (var i = 0; i < array.length; i++) {
            running = running.concat(Linq(array[i]).toArray());
        }
        return new LinqContainer(running);
    }

    public max<U>(picker: Func1<T, U>): U {
        return picker(this.theMax(picker));
    }

    public theMax<U>(picker: Func1<T, U>): T {
        return this._minOrMax(picker, (x, y) => x > y);
    }

    public min<U>(picker: Func1<T, U>): U {
        return picker(this.theMin(picker));
    }

    public theMin<U>(picker: Func1<T, U>): T {
        return this._minOrMax(picker, (x, y) => x < y);
    }

    private _minOrMax<U>(picker: Func1<T, U>, comp: Func2<U, U, boolean>): T {
        var last = this.first();
        var lastValue = picker(last);
        var index = 0;

        this.forEach((x, i) => {
            let current = picker(x);
            if (comp(current, lastValue)) {
                last = x;
                lastValue = current;
                index = i;
            }
        });

        return last;
    }

    public forEach(action: Action2<T, number>): void {
        var i = 0;
        for (let x of this.values)
            action(x, i++);
    }

    /**
        * Makes sure that the given object is an array before returning it. 
        * Otherwise, it converts the item to an array.
        */
    public toArray(): T[] {
        var array = this._asArray();
        if (array)
            return array;
        return Array.from(this.values);
    }

    private _asArray(): T[] | null {
        if (Array.isArray(this.values))
            return <T[]>this.values;
        return null;
    }

    public sum(picker: Func1<T, number>): number {
        var sum = 0;
        this.forEach(x => sum += picker(x));
        return sum;
    }

    public count(predicate?: Func1<T, boolean>): number {
        if (!predicate && Array.isArray(this.values))
            return this.toArray().length;

        let n = 0;
        const counter = predicate
            ? (x: T) => n += predicate(x) ? 1 : 0
            : () => n++;

        this.forEach(x => counter(x));
        return n;
    }

    public average(picker: Func1<T, number>): number {
        return this.sum(picker) / this.count();
    }

    public median(picker: Func1<T, number>): number {
        var values = this.orderBy(picker);
        if (values.count() % 2 == 1)
            return picker(values.itemAt(Math.floor(values.count() / 2)));
        return (picker(values.itemAt(values.count() / 2)) + picker(values.itemAt((values.count() / 2) - 1))) / 2;
    }

    public product(picker: Func1<T, number>): number {
        var prod = 1;
        this.forEach(x => prod *= picker(x));
        return prod;
    }

    public itemAt(index: number): T {
        var array = this._asArray();
        if (array)
            return array[index];
        var i = 0;
        for (let x of this.values) {
            if (i == index)
                return x;
            i++;
        }
        throw Error("Invalid Index");
    }

    public isSubsetOf(set: LinqContainer<T>, comparer?: Func2<T, T, boolean>): boolean {
        const comp: Func2<T, T, boolean> = comparer || ((x, y) => x == y);
        if (this.areAny(x => !set.areAny(y => comp(x, y))))
            return false;
        return true;
    }

    public clone(): T[] {
        if (Array.isArray(this.values))
            return (<T[]>this.values).slice(0);
        var array: T[] = [];
        this.forEach(x => array.push(x));
        return array;
    }

    public toMap<K>(keyPicker: (item: T) => K): Map<K,T> {
        const pairs = this.select(x => tuple(keyPicker(x), x));
        return new Map<K,T>(pairs.toArray());
    }

    static _pickerCompare<T>(picker: Func1<T, any>, compare: Func2<any, any, number>): Func2<T, T, number> {
        return (a: T, b: T): number => {
            var t = picker(a);
            var u = picker(b);
            return compare(t, u);
        }
    }

    static _ascendingCompare<T>(a: T, b: T): number {
        // special case. The < and > operators do not factor in case, so if we're comparing strings, go with a locale compare.
        if (isString(a) && isString(b))
            return (<string><any>a).localeCompare(<string><any>b);

        if (a > b)
            return 1;
        if (a < b)
            return -1;
        return 0;
    }

    static _descendingCompare<T>(a: T, b: T): number {
        // special case. The < and > operators do not factor in case, so if we're comparing strings, go with a locale compare.
        if (isString(a) && isString(b))
            return -(<string><any>a).localeCompare(<string><any>b);

        if (a < b)
            return 1;
        if (a > b)
            return -1;
        return 0;
    }
}

export class Grouping<T, K> extends LinqContainer<T> {
    constructor(public key: K, values: Iterable<T>) {
        super(values);
    }
}

/**
    * Provides methods to perform a merge sort. While typically slower than a quick sort, it is a stable sort, which is sometimes necessary in some conditions.
    */
module MergeSort {
    export function run<T>(values: T[], compareFn: (a: T, b: T) => number) {
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
}
