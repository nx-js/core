import { iterateChildren } from '@nx-js/dom-util'
import { unobserve } from './observer'

export default function cleanupDom (node) {
  const parent = node.parentNode
  if (!parent || parent.$lifecycleStage === 'detached') {
    cleanupNode(node)
  }
}

function cleanupNode (node) {
  if (node.$lifecycleStage === 'attached') {
    node.$lifecycleStage = 'detached'

    if (node.$cleaners) {
      node.$cleaners.forEach(runCleaner, node)
      node.$cleaners = undefined
    }
    cleanupChildren(node)
  }
}

function runCleaner (cleaner) {
  cleaner.fn.apply(this, cleaner.args)
}

function cleanupChildren (node) {
  const shadow = node.shadowRoot
  if (shadow) {
    unobserve(shadow)
    iterateChildren(shadow, cleanupNode)
  } else {
    iterateChildren(node, cleanupNode)
  }
}
