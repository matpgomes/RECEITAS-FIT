/**
 * Logger condicional para ambiente de produção
 * Em produção, suprime logs de erro para não poluir o console
 * Em desenvolvimento, mantém os logs normalmente
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
    error: (...args: unknown[]) => {
        if (isDevelopment) {
            console.error(...args)
        }
        // Em produção, você pode enviar para um serviço de monitoramento como Sentry
        // Sentry.captureException(args[0])
    },

    warn: (...args: unknown[]) => {
        if (isDevelopment) {
            console.warn(...args)
        }
    },

    log: (...args: unknown[]) => {
        if (isDevelopment) {
            console.log(...args)
        }
    },

    info: (...args: unknown[]) => {
        if (isDevelopment) {
            console.info(...args)
        }
    }
}
