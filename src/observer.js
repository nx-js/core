import setupDom from './setupDom'
import cleanupDom from './cleanupDom'

const observerConfig = {childList: true, subtree: true}
const forEach = Array.prototype.forEach

export function observe (node) {
  const observer = new MutationObserver(onMutations)
  observer.observe(node, observerConfig)
  node.$observer = observer
}

export function unobserve (node) {
  if (node.$observer) {
    node.$observer.disconnect()
    node.$observer = undefined
  }
}

function onMutations (mutations, observer) {
  while (mutations.length) {
    mutations.forEach(onMutation)
    mutations = observer.takeRecords()
  }
}

function onMutation (mutation) {
  forEach.call(mutation.removedNodes, cleanupDom)
  forEach.call(mutation.addedNodes, setupDom)
}
