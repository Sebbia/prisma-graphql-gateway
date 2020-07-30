import * as log from "gelf-pro"

const LogLevel = Object.freeze({"TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3, "ERROR": 4})

/**
 * Parse log level from string
 * @param {String} value
 * @return {LogLevel|null}
 */
function parseLogLevel(value) {
    if (value && value instanceof String) {
        let upperValue = value.toUpperCase().trim()
        if (upperValue in LogLevel)
            return LogLevel[upperValue]
    }
    return null
}

class LoggerFactory {
    /**
     * @param {number} level
     * @param {Object} gelfConfig
     */
    constructor(level, gelfConfig) {
        this.__level = level
        this.__gelfEnable = gelfConfig.enable
        if (this.__gelfEnable) {
            log.setConfig({
                adapterName: gelfConfig.protocol,
                adapterOptions: {
                    host: gelfConfig.host,
                    port: gelfConfig.port
                }
            })
        }
    }

    /**
     * @param {String} name
     * @return {Logger}
     */
    getLogger(name) {
        return new Logger(name, this.__level, this.__gelfEnable)
    }
}

class Logger {
    /**
     * @param {String} name
     * @param {number} level
     * @param {Boolean} gelfEnable
     */
    constructor(name, level, gelfEnable) {
        this.__name = name
        this.__level = level
        this.__gelfEnable = gelfEnable
    }

    __processExtra(extra) {
        return {
            raw_data: extra
        }
    }

    /**
     * Log in TRACE level to console only
     * @param {String} message
     * @param {Object} extra
     */
    trace(message, extra) {
        if (LogLevel.TRACE <= this.__level) {
            console.log(`${new Date().toISOString()} ${this.__name} TRACE ${message} | extra: ${JSON.stringify(extra)}`)
        }
    }

    /**
     * Log in DEBUG level
     * @param {String} message
     * @param {Object} extra
     */
    debug(message, extra) {
        if (LogLevel.DEBUG <= this.__level) {
            console.log(`${new Date().toISOString()} ${this.__name} DEBUG ${message} | extra: ${JSON.stringify(extra)}`)
            if (this.__gelfEnable)
                log.debug(message, this.__processExtra(extra))
        }
    }

    /**
     * Log in INFO level
     * @param {String} message
     * @param {Object} extra
     */
    info(message, extra) {
        if (LogLevel.INFO <= this.__level) {
            console.log(`${new Date().toISOString()} ${this.__name} INFO ${message} | extra: ${JSON.stringify(extra)}`)
            if (this.__gelfEnable)
                log.info(message, this.__processExtra(extra))
        }
    }

    /**
     * Log in WARN level
     * @param {String} message
     * @param {Object} extra
     */
    warn(message, extra) {
        if (LogLevel.WARN <= this.__level) {
            console.log(`${new Date().toISOString()} ${this.__name} WARN ${message} | extra: ${JSON.stringify(extra)}`)
            if (this.__gelfEnable)
                log.warn(message, this.__processExtra(extra))
        }
    }

    /**
     * Log in ERROR level
     * @param {String} message
     * @param {Object|Error} extra
     */
    error(message, extra) {
        if (LogLevel.ERROR <= this.__level) {
            console.log(`${new Date().toISOString()} ${this.__name} ERROR ${message} | extra: ${JSON.stringify(extra)}`)
            if (this.__gelfEnable)
                log.error(message, this.__processExtra(extra))
        }
    }
}

export {
    Logger,
    LogLevel,
    LoggerFactory,
    parseLogLevel
}