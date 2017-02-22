import { iterateChildren } from '@nx-js/dom-util'
import { upgrade as upgradeElement } from './registry'
import { validateMiddlewares } from './middlewareValidator'
import runMiddlewares from './runMiddlewares'

const defer = ('requestIdleCallback' in window) ? requestIdleCallback : setTimeout

export default function setupDom (node) {
  const parent = node.parentNode
  if (upgradeElement(node) && shouldSetupDom(node, parent)) {
    setupNode(node, parent)
  }
}

function shouldSetupDom (node, parent) {
  return (
    !node.$lifecycleStage &&
    ((parent && parent.$lifecycleStage === 'attached' && parent.$isolate !== true) ||
    node.$root === node)
  )
}

function setupNode (node, parent) {
  if (upgradeElement(node)) {
    if (node.$heavy) defer(() => processNode(node, parent))
    else processNode(node, parent)
  }
}

function processNode (node, parent) {
  setupBase(node, parent)
  setupState(node, parent)
  setupMiddlewares(node, parent)
  validateMiddlewares(node)
  runMiddlewares(node)
  iterateChildren(node, setupNode)
}

function setupBase (node, parent) {
  node.$lifecycleStage = 'attached'
  node.$root = node.$root || parent.$root
  node.$cleanup = $cleanup
}

function setupMiddlewares (node, parent) {
  if (!node.$contentMiddlewares && !node.$middlewares) {
    node.$validated = true
  }
  if (node.$isolate === 'middlewares') {
    node.$contentMiddlewares = node.$contentMiddlewares || []
  } else if (node.$contentMiddlewares) {
    node.$contentMiddlewares = (parent.$contentMiddlewares || []).concat(node.$contentMiddlewares)
  } else {
    node.$contentMiddlewares = parent.$contentMiddlewares || []
  }
}

function setupState (node, parent) {
  node.$contextState = node.$contextState || parent.$state || {}
  node.$state = node.$state || node.$contextState
  if (node.$state === true) {
    node.$state = {}
  } else if (node.$state === 'inherit') {
    node.$state = Object.create(state, {})
  }
}

function $cleanup (fn, ...args) {
  if (typeof fn !== 'function') {
    throw new TypeError('first argument must be a function')
  }
  this.$cleaners = this.$cleaners || []
  this.$cleaners.push({fn, args})
}
