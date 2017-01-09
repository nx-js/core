# The core

The `core` is a [Web Components](https://developers.google.com/web/fundamentals/getting-started/primers/customelements) based core for the NX framework. You can learn more in [the Docs](http://nx-framework.com/docs).

## Installation

`npm install @nx-js/core`

## Usage

```js
const component = require('@nx-js/core')

component()
  .register('my-comp')
```

```html
<my-comp></my-comp>
```
