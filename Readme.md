# Simple Ql Testing

This library helps writing tests for Simple QL applications

## Overview

You can test your application with this code:

```javascript
const Testing = require('simple-ql-testing')
const test = Testing(url) //url can be "http://localhost:3000/" for instance
function createTest (positive, name, query, expected) {
  return { positive, name, query, expected }
}
test([
  createTest(true, 'good request', { User: { login: 'login', password: 'password', create: true }}),
  createTest(false, 'bad request', 'dummy content'),
]).catch(err => {
  console.error(err.message)
}).then(process.exit)
```

## Getting started

### **Create the test function**

The first thing you will need is the `test` fuction. For this, you need to import the `Testing` function and provide it with the url of the application you wish to test.

```javascript
const Testing = require('simple-ql-testing')
const test = Testing(url) //url can be "http://localhost:3000/" for instance
```

You need to know the following things about the `url`:

 * Simple QL centralizes all the requests on a single url, so there is usually no need to provide different urls. But if you really need to, you can instanciate a new `test` function.
 * You can omit the origin part of the url and keep only the path. In this case, the default will be `http://localhost:80`. You still need to provide the path, though.

### **A Test**

The test function takes a single Test or an array of Tests as single argument.

A Test is an object containing the following properties:

 * **name** {string} The name that will identify the test.
 * **query** {object} The simple-ql request
 * **positive** {boolean} *(optionnal)* Tell if the request should succeed (status<400) or fail (status>400).**Defaults: true**.
 * **expected** {any} *(optionnal)* If provided, the request result will match the server response to the object provided.

You can use the following function to make writing tests easier:

```javascript
function createTest (positive, name, query, expected) {
  return { positive, name, query, expected }
}
```

### **Run a test suite**

This is how you can run a test suite.

```javascript
test([
  createTest(true, 'good request', { User: { login: 'login', password: 'password', create: true }}),
  createTest(false, 'bad request', 'dummy content'),
]).then(() => console.log('SUCCESS'), err => console.error('FAILED:', err.message))
```

**Note**: The tests will run sequentially, and in order. The `test` function returns a Promise resolved if all the tests where resolved, and rejected as soon as one test fails. The next tests in the suite will not be run.