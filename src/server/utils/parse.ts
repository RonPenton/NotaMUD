
export const tokens = (str: string) => str.split(/\s+/gi);

export const split = (str: string) => {
    const match = /(\w+)\s*(.*)/gi.exec(str) || [];
    return { 
        head: match.length > 1 ? match[1] : "", 
        tail: match.length > 2 ? match[2] : "" 
    };
}