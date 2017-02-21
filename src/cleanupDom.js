import { iterateChildren } from '@nx-js/dom-util'

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
    iterateChildren(node, cleanupNode)
  }
}

function runCleaner (cleaner) {
  cleaner.fn.apply(this, cleaner.args)
}
