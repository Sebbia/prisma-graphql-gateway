import {config as cfg} from 'dotenv';
import {toNullableBoolean} from './utils/toBool'
import {version} from './package.json'
import {LoggerFactory, LogLevel, parseLogLevel} from "./logger";

// Read env vars from .env files in dev environment
cfg()

if (!process.env.ENDPOINTS)
    throw new Error("<8ed79eaf> ENDPOINTS env is not provided")

let endpoints = process.env.ENDPOINTS.split(',')
let enableWS = toNullableBoolean(process.env.WS_ENABLE) || false

let enableSentry = toNullableBoolean(process.env.SENTRY_ENABLE) || false
if (enableSentry) {
    if (!process.env.SENTRY_DSN)
        throw new Error("<28f7577e> SENTRY_DSN env is not provided")
}

let enableGelf = toNullableBoolean(process.env.GELF_ENABLE) || false
if (enableGelf) {
    if (!process.env.GELF_HOST)
        throw new Error("<1e9ddfa> GELF_HOST env is not provided")
}

let logLevel = parseLogLevel(process.env.LOG_LEVEL) ? process.env.LOG_LEVEL : undefined

let config = {
    graphqlApis: endpoints,
    externalEndpoint: process.env.EXTERNAL_URI || "/",
    enableQueryLogging: toNullableBoolean(process.env.QUERY_LOG_ENABLE) || false,
    enableWS: enableWS,
    sentryConfig: {
        enable: enableSentry,
        dsn: process.env.SENTRY_DSN,
        release: process.env.SENTRY_RELEASE || version,
        environment: process.env.SENTRY_ENV || "debug"
    },
    scopeHeader: process.env.SCOPE_HEADER || "Operation-Scope",
    logLevel: logLevel || LogLevel.INFO,
    gelfConfig: {
        enable: enableGelf,
        host: process.env.GELF_HOST,
        port: process.env.GELF_PORT || 12201,
        protocol: process.env.GELF_PROTOCOL || "udp"
    }
};

let defaultLoggerFactory = new LoggerFactory(config.logLevel, config.gelfConfig)

export {
    config,
    defaultLoggerFactory
} ;