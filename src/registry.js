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

  if (config.extends) {
    forEach.call(document.querySelectorAll(`[is=${name}]`), setupDom)
  } else {
    forEach.call(document.getElementsByTagName(name), setupDom)
  }
}

export function upgrade (elem) {
  if (elem.nodeType !== 1 || elem.$upgraded) {
    return true
  }
  const name = (elem.getAttribute('is') || elem.tagName).toLowerCase()
  if (name.indexOf('-') !== -1) {
    const config = registry.get(name)
    if (config) {
      upgradeElement(elem, config)
      return true
    } else {
      runLoader(name)
      return false
    }
  }
  return true
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
