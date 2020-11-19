enum LogLevel {
    TRACE,
    DEBUG,
    INFO,
    WARN,
    ERROR
}

/**
 * Parse log level from string
 */
function parseLogLevel(value?: string | null): LogLevel | null {
    if (value != null && typeof value == "string") {
        let upperValue = value.toUpperCase().trim()
        return (<any>LogLevel)[upperValue] || null
    }
    return null
}

interface GelfConfig {
    enable: boolean
    protocol?: 'tcp-tls' | 'tcp' | 'udp'
    host: string
    port: number
    serviceName: string
    deployType: string
}

class LoggerFactory {
    level: number;
    gelfEnable: boolean;

    constructor(level: LogLevel, gelfConfig: GelfConfig) {
        this.level = level
        this.gelfEnable = gelfConfig.enable
        if (this.gelfEnable) {
            console.warn("Sorry, Gelf logging is not working now. Watch current status in GitHub issues: https://github.com/Sebbia/prisma-graphql-gateway/issues/20")
        }
    }

    /**
     * Makes logger with default params
     */
    getLogger(name: string): Logger {
        return new Logger(name, this.level, this.gelfEnable)
    }
}

class Logger {
    name: string;
    level: LogLevel;
    gelfEnable: boolean;

    constructor(name: string, level: LogLevel, gelfEnable: boolean) {
        this.name = name
        this.level = level
        this.gelfEnable = gelfEnable
    }

    // private processExtra(extra: any) {
    //     return {
    //         raw_data: JSON.stringify(extra)
    //     }
    // }

    /**
     * Log in TRACE level to console only
     */
    trace(message: string, extra?: any) {
        if (LogLevel.TRACE <= this.level) {
            console.log(`${new Date().toISOString()} ${this.name} TRACE ${message} | extra: ${JSON.stringify(extra)}`)
        }
    }

    /**
     * Log in DEBUG level
     */
    debug(message: string, extra?: any) {
        if (LogLevel.DEBUG <= this.level) {
            console.log(`${new Date().toISOString()} ${this.name} DEBUG ${message} | extra: ${JSON.stringify(extra)}`)
            // if (this.gelfEnable)
            //     gelfLog.debug(message, this.processExtra(extra))
        }
    }

    /**
     * Log in INFO level
     * @param {String} message
     * @param {Object} extra
     */
    info(message: string, extra?: any) {
        if (LogLevel.INFO <= this.level) {
            console.log(`${new Date().toISOString()} ${this.name} INFO ${message} | extra: ${JSON.stringify(extra)}`)
            // if (this.gelfEnable)
            //     gelfLog.info(message, this.processExtra(extra))
        }
    }

    /**
     * Log in WARN level
     * @param {String} message
     * @param {Object} extra
     */
    warn(message: string, extra?: any) {
        if (LogLevel.WARN <= this.level) {
            console.log(`${new Date().toISOString()} ${this.name} WARN ${message} | extra: ${JSON.stringify(extra)}`)
            // if (this.gelfEnable)
            //     gelfLog.warn(message, this.processExtra(extra))
        }
    }

    /**
     * Log in ERROR level
     * @param {String} message
     * @param {Object|Error} extra
     */
    error(message: string, extra?: any) {
        if (LogLevel.ERROR <= this.level) {
            console.log(`${new Date().toISOString()} ${this.name} ERROR ${message} | extra: ${JSON.stringify(extra)}`)
            // if (this.gelfEnable)
            //     gelfLog.error(message, this.processExtra(extra))
        }
    }
}

export {
    Logger,
    LogLevel,
    LoggerFactory,
    parseLogLevel
}