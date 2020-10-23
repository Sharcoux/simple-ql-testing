// @ts-check

/** @type {import('assert')} */
const assert = require('assert').strict
const util = require('util')
const log = require('./logger')
/** @type {import('axios').default} */
// @ts-ignore
const axios = require('axios')

/** @typedef {import('axios').AxiosResponse} AxiosResponse */
/** @typedef {import('axios').AxiosError} AxiosError */

/**
 * Log the request result in case of success
 * @param {AxiosResponse} response The response from axios request
 * @param {object} expected The expected result of the request (response.data)
 * @returns {AxiosResponse}
 */
function logResponse (response, expected) {
  if (expected) {
    assert.deepStrictEqual(response.data, expected)
  }
  log('test response', util.inspect(response.data, false, null, true), '\n')
  return response
}

/**
 * Log the request result in case of error
 * @param {AxiosError} response The response from axios request
 * @param {object} expected The expected result of the request (response.response.data)
 */
function logError (response, expected) {
  if (expected && response.response) {
    assert.deepStrictEqual(response.response.data, expected)
  }
  log('test error response', response.message, util.inspect(response.response && response.response.data, false, null, true), '\n')
}

/**
 * Throw an error if the request succeeds
 * @param {AxiosResponse} response The response from axios request
 * @throws {Error} Throw an error if the request succeeds
 */
function shouldFail (response) {
  log('test response', util.inspect(response.data, false, null, true), '\n')
  throw new Error('The previous request succeeded whereas it should have failed')
}

/**
 * Throw an error if the request fails
 * @param {AxiosError} response The response from axios request
 * @throws {Error} Throw an error if the request fails
 * @returns {AxiosResponse} This is just for type requirement
 */
function shouldSucceed (response) {
  log('test error response', response.message, util.inspect(response.response && response.response.data, false, null, true), '\n')
  throw new Error('The previous request failed whereas it should have succeeded')
}

/** @typedef Test
 * @property {boolean} positive Should the request succeed or not
 * @property {string} name The name of this test
 * @property {object} query The simple ql request to be tested
 * @property {object=} expected The expected result of the request
 */

/**
 * Create a set of tests for a simple-ql endpoint
 * @param {string} url The endpoint to be tested
 * @returns {(testSuite: Test[] | Test) => Promise<void | AxiosResponse>}
 */
const createTests = url => {
  if (!url) throw new Error('url must be provided as first argument of simple-ql-testing')
  /**
   * Send the request to the endpoint
   * @param {object} req The simple-ql request
   * @returns {Promise<AxiosResponse>}
   */
  function request (req) {
    log('test request', req)
    return axios.post(url, req)
  }
  /**
   * Handle a positive test
   * @param {string} name The test name
   * @param {object} query The simple-ql request
   * @param {object=} expected The expected result
   * @returns {Promise<AxiosResponse | void>}
   */
  function positiveTest (name = 'test name', query = {}, expected) {
    return Promise.resolve()
      .then(() => log('test title', '\n', name))
      .then(() => request(query))
      .then(result => logResponse(result, expected), shouldSucceed)
  }
  /**
   * Handle a negative test
   * @param {string} name The test name
   * @param {object} query The simple-ql request
   * @param {object=} expected The expected result
   * @returns {Promise<void>}
   */
  function negativeTest (name = 'test name', query, expected) {
    return Promise.resolve()
      .then(() => log('test error title', '\n', name))
      .then(() => request(query))
      .then(shouldFail, result => logError(result, expected))
  }
  /**
   * Execute a Test
   * @param {Test} currentTest The test to be executed
   */
  function test ({ positive = true, name = 'test name', query, expected } = { positive: true, name: 'test name', query: {} }) {
    if (!name || name === 'test name') throw new Error('Tests must have a name. Ex: {name: "Is server available", query: {}}.')
    if (!query) throw new Error('Tests must contain a query to address to the server. Ex: {name: "Is server available", query: {}}.')
    return () => positive ? positiveTest(name, query, expected) : negativeTest(name, query, expected)
  }
  return testList => Array.isArray(testList) ? testList.reduce((chain, next) => chain.then(test(next)), Promise.resolve()) : test(testList)()
}

/**
 * Create a new test
 * @param {boolean} positive Should the request succeed or not
 * @param {string} name The name of this test
 * @param {object} query The simple ql request to be tested
 * @param {object=} expected The expected result of the request
 * @returns {Test} The test created
 */
const createTest = (positive, name, query, expected) => ({ positive, name, query, expected })

/**
 * Set the new value of the jwt token
 * @param {string} jwt The jwt token
 */
const setJWT = jwt => (axios.defaults.headers.common.Authorization = 'Bearer ' + jwt)

/** Remove the current jwt token */
const removeJWT = () => delete axios.defaults.headers.common.Authorization

module.exports = createTests
module.exports.createTest = createTest
module.exports.setJWT = setJWT
module.exports.removeJWT = removeJWT
module.exports.axios = axios
