export const isString = (item: any): item is string => {
    return typeof item === 'string';
}

export interface Func0<R> { (): R; }
export interface Func1<P, R> { (parameter: P): R; }
export interface Func2<P1, P2, R> { (parameter1: P1, parameter2: P2): R; }
export interface Func3<P1, P2, P3, R> { (parameter1: P1, parameter2: P2, parameter3: P3): R; }
export interface Func4<P1, P2, P3, P4, R> { (parameter1: P1, parameter2: P2, parameter3: P3, parameter4: P4): R; }

export interface Action0 { (): void; }
export interface Action1<P> { (parameter: P): void; }
export interface Action2<P1, P2> { (parameter1: P1, parameter2: P2): void; }
export interface Action3<P1, P2, P3> { (parameter1: P1, parameter2: P2, parameter3: P3): void; }
export interface Action4<P1, P2, P3, P4> { (parameter1: P1, parameter2: P2, parameter3: P3, parameter4: P4): void; }


export function tuple<T,U>(t: T, u: U): [T, U] {
    return [t,u];
}
