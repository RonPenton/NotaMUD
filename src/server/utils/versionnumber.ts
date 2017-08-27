export class VersionNumber {
    constructor(private major: number, private minor: number, private build: number) { }

    public toString() {
        return `${this.major}.${this.minor}.${this.build}`;
    }
    public equals(other: VersionNumber): boolean {
        return other.major == this.major && other.minor == this.minor && other.build == this.build;
    }
    public lessThan(other: VersionNumber): boolean {
        return other.major > this.major && other.minor > this.minor && other.build > this.build;
    }
    public lessThanEqual(other: VersionNumber): boolean {
        return this.lessThan(other) || this.equals(other);
    }
    public greaterThan(other: VersionNumber): boolean {
        return !this.lessThanEqual(other);
    }
    public greaterThanEqual(other: VersionNumber): boolean {
        return !this.lessThan(other);
    }
}

export default VersionNumber;

