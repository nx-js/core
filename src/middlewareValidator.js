const names = new Set()
const missing = new Set()
const duplicates = new Set()

export function validateMiddlewares (node, parent) {
  const contentMiddlewares = parent.$contentMiddlewares
  const middlewares = node.$middlewares

  if (!node.$validated && (contentMiddlewares || middlewares)) {
    names.clear()
    missing.clear()
    duplicates.clear()

    if (contentMiddlewares) {
      contentMiddlewares.forEach(validateMiddleware)
    }
    if (middlewares) {
      middlewares.forEach(validateMiddleware)
    }
    if (missing.size) {
      throw new Error(`Missing middlewares in ${node.tagName || node.nodeValue}: ${Array.from(missing).join()}`)
    }
    if (duplicates.size) {
      throw new Error(`Duplicate middlewares in ${node.tagName || node.nodeValue}: ${Array.from(duplicates).join()}`)
    }
  }
}

export function prevalidateMiddlewares (contentMiddlewares, middlewares) {
  names.clear()
  missing.clear()
  duplicates.clear()

  if (contentMiddlewares) {
    contentMiddlewares.forEach(validateMiddleware)
  }
  if (middlewares) {
    middlewares.forEach(validateMiddleware)
  }
  return (missing.size + duplicates.size === 0)
}

export function validateMiddleware (middleware) {
  const name = middleware.$name
  const require = middleware.$require
  if (name) {
    if (names.has(name)) {
      duplicates.add(name)
    }
    names.add(name)
  }
  if (require) {
    for (let dependency of require) {
      if (!names.has(dependency)) {
        missing.add(dependency)
      }
    }
  }
}
