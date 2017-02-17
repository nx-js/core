'use strict'

const loaders = new Map ()

function register (name, loader) {
  loaders.set(name, loader)
}

function run (name) {
  const loader = loaders.get(name)
  if (loader) {
    loader()
    loaders.delete(name)
  }
}

module.exports = {
  register,
  run
}
