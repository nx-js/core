'use strict'

const registry = new Map()

function register (name, config) {
  name = name.toLowerCase()
  if (registry.has(name)) {
    throw new Error('double registration')
  }

  registry.set(name, config)
}

function upgrade (name, node) {
  const config = registry.get(name)
  if (!config) {
    return false
  }
  node.$state = config.state
  node.$isolate = config.isolate
  node.$heavy = config.heavy
  node.$contentMiddlewares = config.contentMiddlewares
  node.$middlewares = config.middlewares
  node.$shouldValidate = config.shouldValidate
  if (config.root) {
    node.$root = node
  }
  return true
}

const originalCreateElement = document.createElement
document.createElement = function createElement (name, is) {
  const element = originalCreateElement.call(document, name)
  if (is) {
    element.setAttribute('is', is)
  }
  return element
}

module.exports = {
  register,
  upgrade
}
