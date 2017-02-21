import validateConfig from './validateConfig'
import { prevalidateMiddlewares } from './middlewareValidator'
import { register as registerElement } from './registry'

const secret = {
  config: Symbol('component config')
}

export default function component (rawConfig) {
  return {use, useOnContent, register, [secret.config]: validateConfig(rawConfig)}
}

function use (middleware) {
  if (typeof middleware !== 'function') {
    throw new TypeError('first argument must be a function')
  }
  if (middleware.$type && middleware.$type !== 'component') {
    throw new Error(`${middleware.$name} can't be used as a component middleware`)
  }
  const config = this[secret.config]
  config.middlewares = config.middlewares || []
  config.middlewares.push(middleware)
  return this
}

function useOnContent (middleware) {
  if (typeof middleware !== 'function') {
    throw new TypeError('first argument must be a function')
  }
  if (middleware.$type && middleware.$type !== 'content') {
    throw new Error(`${middleware.$name} can't be used as a content middleware`)
  }
  const config = this[secret.config]
  if (config.isolate === true) {
    console.log('warning: content middlewares have no effect inside isolated components')
  }
  config.contentMiddlewares = config.contentMiddlewares || []
  config.contentMiddlewares.push(middleware)
  return this
}

function register (name) {
  if (typeof name !== 'string') {
    throw new TypeError('first argument must be a string')
  }
  const config = this[secret.config]
  config.validated = prevalidateMiddlewares(config.contentMiddlewares, config.middlewares)
  registerElement(name, config)
}
