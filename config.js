import { config  as cfg } from 'dotenv';
import { toNullableBoolean } from './utils/toBool'
import { version } from './package.json'

// Read env vars from .env files in dev environment
cfg()

if (!process.env.ENDPOINTS)
    throw new Error("<8ed79eaf> ENDPOINTS env is not provided")

let endpoints = process.env.ENDPOINTS.split(',')
let enableWS = toNullableBoolean(process.env.WS_ENABLE) || false

let enableSentry = toNullableBoolean(process.env.SENTRY_ENABLE) || false
if(enableSentry){
    if (!process.env.SENTRY_DSN)
        throw new Error("<28f7577e> SENTRY_DSN env is not provided")
}

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
    scopeHeader: process.env.SCOPE_HEADER || "Operation-Scope"
};

export default config;