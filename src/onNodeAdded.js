'use strict'

const validateMiddlewares = require('./validateMiddlewares')
const runMiddlewares = require('./runMiddlewares')
const loaders = require('./loaders')
const defer = ('requestIdleCallback' in window) ? requestIdleCallback : setTimeout

module.exports = function onNodeAdded (node, context) {
  const parent = node.parentNode
  const validParent = (parent && parent.$lifecycleStage === 'attached')
  if (validParent && node === node.$root) {
    throw new Error(`Nested root component: ${node.tagName}`)
  }
  if ((validParent || node === node.$root) && context.isolate !== true) {
    processNode(node, context.state, context.contentMiddlewares, context.root)
  }
}

function processNode (node, state, contentMiddlewares, root) {
  if (node.$heavy) {
    defer(() => setupNode(node, state, contentMiddlewares, root))
  } else {
    setupNode(node, state, contentMiddlewares, root)
  }
}

function setupNode (node, state, contentMiddlewares, root) {
  if (!shouldSetup(node)) return
  node.$lifecycleStage = 'attached'

  node.$contextState = node.$contextState || state || node.$state
  node.$state = node.$state || node.$contextState
  if (node.$inheritState) {
    Object.setPrototypeOf(node.$state, node.$contextState)
  }

  node.$root = node.$root || root

  if (node.$isolate === 'middlewares') {
    contentMiddlewares = node.$contentMiddlewares || []
  } else if (node.$contentMiddlewares) {
    contentMiddlewares = contentMiddlewares.concat(node.$contentMiddlewares)
  }
  if (node.$shouldValidate) {
    validateMiddlewares(contentMiddlewares, node.$middlewares, true)
  }
  node.$cleanup = $cleanup

  runMiddlewares(node, contentMiddlewares, node.$middlewares)

  if (node.nodeType === 1 && node.$isolate !== true) {
    let child = node.firstChild
    while (child) {
      processNode(child, node.$state, contentMiddlewares, node.$root)
      child = child.nextSibling
    }

    child = node.shadowRoot ? node.shadowRoot.firstChild : undefined
    while (child) {
      processNode(child, node.$state, contentMiddlewares, node.shadowRoot)
      child = child.nextSibling
    }
  }
}

function shouldSetup (node) {
  if (node.$lifecycleStage) {
    return false
  }
  if (node.nodeType === 1) {
    const name = (node.getAttribute('is') || node.tagName).toLowerCase()
    if (name.indexOf('-') !== -1 && !node.$registered) {
      loaders.run(name)
      return false
    }
    return true
  }
  if (node.nodeType === 3) {
    return node.nodeValue.trim()
  }
}

function $cleanup (fn, ...args) {
  if (typeof fn !== 'function') {
    throw new TypeError('first argument must be a function')
  }
  this.$cleaners = this.$cleaners || []
  this.$cleaners.push({fn, args})
}
