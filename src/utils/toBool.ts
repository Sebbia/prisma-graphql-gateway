const TRUTHY_VALUES = ['y', 'yes', 'true', 'enable']

function toNullableBoolean(value: string | undefined | null | number): boolean | null {
    if (value === undefined || value === null)
        return null

    let cleanedValue = value.toString().trim().toLowerCase();

    // Empty string is considered a falsy value
    if (!cleanedValue.length) {
        return false;

        // Any number above zero is considered a truthy value
    } else if (!isNaN(Number(cleanedValue))) {
        return Number(cleanedValue) > 0;

        // Any value not marked as a truthy value is automatically falsy
    } else {
        return TRUTHY_VALUES.indexOf(cleanedValue) >= 0;
    }
}

export {
    toNullableBoolean
};