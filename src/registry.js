import setupDom from './setupDom'
import { run as runLoader } from './loaders'

const registry = new Map()
const forEach = Array.prototype.forEach

export function register (name, config) {
  name = name.toLowerCase()
  if (registry.has(name)) {
    throw new Error('double registration')
  }
  registry.set(name, config)
  processRegistered(name, config)
}

function processRegistered (name, config) {
  if (config.element) {
    forEach.call(document.querySelectorAll(`${config.element}[is=${name}]`), setupDom)
  } else {
    forEach.call(document.getElementsByTagName(name), setupDom)
  }
}

export function upgrade (elem) {
  if (elem.nodeType === 1 && !elem.$upgraded) {
    const tag = elem.tagName.toLowerCase()
    const name = elem.getAttribute('is') || tag
    if (name.indexOf('-') !== -1) {
      return processElement(elem, name, tag)
    }
  }
  return true
}

function processElement (elem, name, tag) {
  const config = registry.get(name)
  if (config) {
    validateConfig(config, tag)
    upgradeElement(elem, config)
    return true
  }
  runLoader(name)
}

function validateConfig (config, tag) {
  if (config.element && config.element !== tag) {
    throw new Error('Type extension used on the wrong element.')
  }
}

function upgradeElement (elem, config) {
  elem.$state = config.state
  elem.$isolate = config.isolate
  elem.$heavy = config.heavy
  elem.$contentMiddlewares = config.contentMiddlewares
  elem.$middlewares = config.middlewares
  elem.$validated = config.validated
  if (config.root) {
    elem.$root = elem
  }
  elem.classList.add(config.class)
  elem.$upgraded = true
}

const originalCreateElement = document.createElement
document.createElement = function createElement (name, is) {
  const element = originalCreateElement.call(document, name)
  if (is) {
    element.setAttribute('is', is)
  }
  return element
}
