import setupDom from './setupDom'
import cleanupDom from './cleanupDom'
import { observe, unobserve } from './observer'

let documentObserved = false

export default function registerRoot (name, config) {
  if ('customElements' in window) {
    registerRootV1(name, config)
  } else if ('registerElement' in document) {
    registerRootV0(name, config)
  } else if (!documentObserved) {
    observe(document)
    documentObserved = true
  }
}

function registerRootV1 (name, config) {
  const parentProto = getParentProto(config)
  const parentConstructor = getParentConstructor(config)

  function RootElement () {
    return Reflect.construct(parentConstructor, [], RootElement)
  }
  const proto = RootElement.prototype
  proto.connectedCallback = attachedCallback
  proto.disconnectedCallback = detachedCallback
  Object.setPrototypeOf(proto, parentProto)
  Object.setPrototypeOf(RootElement, parentConstructor)
  customElements.define(name, RootElement, { extends: config.element })
}

function registerRootV0 (name, config) {
  const parentProto = getParentProto(config)
  const proto = Object.create(parentProto)
  proto.attachedCallback = attachedCallback
  proto.detachedCallback = detachedCallback
  document.registerElement(name, { prototype: proto, extends: config.element })
}

function getParentProto (config) {
  if (config.element) {
    return Object.getPrototypeOf(document.createElement(config.element))
  }
  return HTMLElement.prototype
}

function getParentConstructor (config) {
  if (config.element) {
    return document.createElement(config.element).constructor
  }
  return HTMLElement
}

function attachedCallback () {
  setupDom(this)
  observe(this)
}

function detachedCallback () {
  cleanupDom(this)
  unobserve(this)
}
