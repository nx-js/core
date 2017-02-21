let node, type
let index, middlewares
let contentIndex, contentMiddlewares

export default function runMiddlewares (currNode) {
  node = currNode
  type = node.nodeType
  middlewares = node.$middlewares
  contentMiddlewares = node.$contentMiddlewares
  index = contentIndex = 0
  next()
  node = middlewares = contentMiddlewares = undefined
}

function next () {
  const middleware = contentMiddlewares[contentIndex++] || (middlewares && middlewares[index++])
  if (middleware) {
    runMiddleware(middleware)
    next()
  }
}

function runMiddleware (middleware) {
  if (middleware.$allow && middleware.$allow.indexOf(type) === -1) {
    throw new Error(`The ${middleware.$name} middleware can't be used on ${type} type nodes.`)
  }
  if (!middleware.$process || middleware.$process.indexOf(type) !== -1) {
    middleware.call(node, node, node.$state, next)
  }
}
