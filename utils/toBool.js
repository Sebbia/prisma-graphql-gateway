const TRUTHY_VALUES = ['y', 'yes', 'true', 'enable']

function toNullableBoolean(value) {
    if (value === undefined || value === null)
        return value

    let cleanedValue = value.toString().trim().toLowerCase();

    // Empty string is considered a falsy value
    if (!cleanedValue.length) {
        return false;

        // Any number above zero is considered a truthy value
    } else if (!isNaN(Number(cleanedValue))) {
        return cleanedValue > 0;

        // Any value not marked as a truthy value is automatically falsy
    } else {
        return TRUTHY_VALUES.indexOf(cleanedValue) >= 0;
    }
}

export {
    toNullableBoolean
};