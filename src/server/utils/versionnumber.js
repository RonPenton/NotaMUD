export class VersionNumber {
    constructor(major, minor, build) {
        this.major = major;
        this.minor = minor;
        this.build = build;
    }
    toString() {
        return `${this.major}.${this.minor}.${this.build}`;
    }
    equals(other) {
        return other.major == this.major && other.minor == this.minor && other.build == this.build;
    }
    lessThan(other) {
        return other.major > this.major && other.minor > this.minor && other.build > this.build;
    }
    lessThanEqual(other) {
        return this.lessThan(other) || this.equals(other);
    }
    greaterThan(other) {
        return !this.lessThanEqual(other);
    }
    greaterThanEqual(other) {
        return !this.lessThan(other);
    }
}
export default VersionNumber;
