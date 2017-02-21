let node
let index, middlewares, middlewaresLength
let contentIndex, contentMiddlewares, contentMiddlewaresLength

export default function runMiddlewares (currNode) {
  node = currNode
  middlewares = node.$middlewares
  contentMiddlewares = node.$contentMiddlewares
  middlewaresLength = middlewares ? middlewares.length : 0
  contentMiddlewaresLength = contentMiddlewares ? contentMiddlewares.length : 0
  index = contentIndex = 0
  next()
  node = middlewares = contentMiddlewares = undefined
}

function next () {
  if (contentIndex < contentMiddlewaresLength) {
    contentMiddlewares[contentIndex++].call(node, node, node.$state, next)
    next()
  } else if (index < middlewaresLength) {
    middlewares[index++].call(node, node, node.$state, next)
    next()
  }
}
