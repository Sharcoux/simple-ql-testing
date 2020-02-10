const assert = require('assert').strict
const util = require('util')
const log = require('./logger')
const axios = require('axios')

function logResponse (response, expected) {
  if (expected) {
    assert.deepStrictEqual(response.data, expected)
  }
  log('test response', util.inspect(response.data, false, null, true), '\n')
  return response
}
function logError (response, expected) {
  if (expected && response.response) {
    assert.deepStrictEqual(response.response.data, expected)
  }
  log('test error response', response.message, util.inspect(response.response && response.response.data, false, null, true), '\n')
  return response
}
function shouldFail (response) {
  log('test response', util.inspect(response.data, false, null, true), '\n')
  throw new Error('The previous request succeeded whereas it should have failed')
}
function shouldSucceed (response) {
  log('test error response', response.message, util.inspect(response.response && response.response.data, false, null, true), '\n')
  throw new Error('The previous request failed whereas it should have succeeded')
}

module.exports = url => {
  if (!url) throw new Error('url must be provided as first argument of simple-ql-testing')
  function request (req) {
    log('test request', req)
    return axios.post(url, req)
  }
  function positiveTest (name = 'test name', query = {}, expected) {
    return Promise.resolve()
      .then(() => log('test title', '\n', name))
      .then(() => request(query))
      .then(result => logResponse(result, expected), shouldSucceed)
  }
  function negativeTest (name = 'test name', query, expected) {
    return Promise.resolve()
      .then(() => log('test error title', '\n', name))
      .then(() => request(query))
      .then(shouldFail, result => logError(result, expected))
  }
  function test ({ positive = true, name = 'test name', query, expected } = {}) {
    if (!name || name === 'test name') throw new Error('Tests must have a name. Ex: {name: "Is server available", query: {}}.')
    if (!query) throw new Error('Tests must contain a query to address to the server. Ex: {name: "Is server available", query: {}}.')
    return () => positive ? positiveTest(name, query, expected) : negativeTest(name, query, expected)
  }
  return testList => Array.isArray(testList) ? testList.reduce((chain, next) => chain.then(test(next)), Promise.resolve()) : test(testList)()
}
