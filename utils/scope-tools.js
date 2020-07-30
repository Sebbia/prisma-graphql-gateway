class ScopeIdGenerator {
    lastId = "";
    counter = 0;

    /**
     * Internal only
     * @param {Date} date
     * @returns {String}
     */
    _formatDate(date) {
        return date.toISOString().replace(/\D/g, '')
    }

    /**
     * @returns {String}
     */
    generateId() {
        let id = this._formatDate(new Date());
        if (id != this.lastId) {
            this.counter = 0;
            this.lastId = id
        }
        let suffix = this.counter.toString().padStart(4, "0")
        this.counter++
        return id + suffix
    }
}

class Scope {
    static EMPTY = new Scope("", null)

    constructor(id, description) {
        this.id = id
        this.description = description
    }

    toString() {
        return `<scope:${this.id}>`
    }
}

class ScopeService {
    /**
     * @param {ScopeIdGenerator} scopeIdGenerator
     */
    constructor(scopeIdGenerator) {
        this.idGenerator = scopeIdGenerator
    }

    /**
     * Create new scope
     * @param {String} description
     * @returns {Scope}
     */
    createScope(description) {
        let id = this.idGenerator.generateId();
        return new Scope(id, description)
    }
}

export {
    ScopeIdGenerator,
    Scope,
    ScopeService
}