const loaders = new Map()

export function register (name, loader) {
  loaders.set(name, loader)
}

export function run (name) {
  const loader = loaders.get(name)
  if (loader) {
    loader()
    loaders.delete(name)
  }
}
