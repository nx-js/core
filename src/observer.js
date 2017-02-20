'use strict'

const onNodeAdded = require('./onNodeAdded')
const onNodeRemoved = require('./onNodeRemoved')
const forEach = Array.prototype.forEach

const observer = new MutationObserver(onMutations)
observer.observe(document, {childList: true, subtree: true})

function onMutations (mutations) {
  for (let mutation of mutations) {
    forEach.call(mutation.removedNodes, onNodeRemoved)
    forEach.call(mutation.addedNodes, onNodeAdded)
  }
  mutations = observer.takeRecords()
  if (mutations.length) {
    onMutations(mutations)
  }
}
