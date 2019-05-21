'use strict'

// const Raven = require('raven')

const Sentry = require('sentry')
const Config = use('Config')

// env para identifica ambiente de desenvolvimento ou produção
const Env = use('Env')
// youch é um formatador de erros
const Youch = use('Youch')
const BaseExceptionHandler = use('BaseExceptionHandler')

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {
  /**
   * Handle exception thrown during the HTTP lifecycle
   *
   * @method handle
   *
   * @param  {Object} error
   * @param  {Object} options.request
   * @param  {Object} options.response
   *
   * @return {void}
   */
  async handle (error, { request, response }) {
    if (error.name === 'validationException') {
      return response.status(error.status).send(error.messages)
    }

    if (Env.get('NODE_ENV') === 'development') {
      const youch = new Youch(error, request.request)
      const errorJSON = await youch.toJSON()

      return response.status(error.status).send(errorJSON)
    }

    return response.status(error.status)
  }

  /**
   * Report exception for logging or debugging.
   *
   * @method report
   *
   * @param  {Object} error
   * @param  {Object} options.request
   *
   * @return {void}
   */
  async report (error, { request, auth }) {
    // console.log(error)
    // Raven.config(Config.get('services.sentry.dsn'))
    // Raven.captureException(error)
    Sentry.init({ dsn: Config.get('services.sentry.dsn') })
    Sentry.captureException(error, request, auth)
  }
}

module.exports = ExceptionHandler
