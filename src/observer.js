import setupDom from './setupDom'
import cleanupDom from './cleanupDom'

const forEach = Array.prototype.forEach

const observer = new MutationObserver(onMutations)
observer.observe(document, {childList: true, subtree: true})

function onMutations (mutations) {
  while (mutations.length) {
    mutations.forEach(onMutation)
    mutations = observer.takeRecords()
  }
}

function onMutation (mutation) {
  forEach.call(mutation.removedNodes, cleanupDom)
  forEach.call(mutation.addedNodes, setupDom)
}
