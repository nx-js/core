'use strict'

const validateConfig = require('./validateConfig')
const validateMiddlewares = require('./validateMiddlewares')
const registry = require('./registry')
const onNodeAdded = require('./onNodeAdded')
const onNodeRemoved = require('./onNodeRemoved')
const forEach = Array.prototype.forEach

const secret = {
  config: Symbol('component config')
}

module.exports = function component (rawConfig) {
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
  config.shouldValidate = validateMiddlewares(config.contentMiddlewares, config.middlewares)
  registry.register(name, config)
  if (config.extends) {
    forEach.call(document.querySelectorAll(`[is=${name}]`), onNodeAdded)
  } else {
    forEach.call(document.getElementsByTagName(name), onNodeAdded)
  }
}
