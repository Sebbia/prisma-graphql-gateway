/**
 * Synchonous generate Scope Id
 */
class ScopeIdGenerator {
    lastId: string = "";
    counter: number = 0;

    /**
     * Format date to YYYYMMDDHHmmSS
     */
    private formatDate(date: Date): string {
        return date.toISOString().replace(/\D/g, '')
    }

    generateId(): string {
        let id = this.formatDate(new Date());
        if (id != this.lastId) {
            this.counter = 0;
            this.lastId = id
        }
        let suffix = this.counter.toString().padStart(4, "0")
        this.counter++
        return id + suffix
    }
}

/**
 * Request scope
 */
class Scope {
    static EMPTY = new Scope("")
    id: string;
    description?: string

    constructor(id: string, description?: string) {
        this.id = id
        this.description = description
    }

    toString(): string {
        return `<scope:${this.id}>`
    }
}

/**
 * Centralized scope creation
 */
class ScopeService {
    idGenerator: ScopeIdGenerator;

    constructor(scopeIdGenerator: ScopeIdGenerator) {
        this.idGenerator = scopeIdGenerator
    }

    /**
     * Create new scope
     */
    createScope(description: string) {
        let id = this.idGenerator.generateId();
        return new Scope(id, description)
    }
}

export {
    ScopeIdGenerator,
    Scope,
    ScopeService
}