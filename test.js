const Testing = require('./')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const log = require('./logger')

app.use(bodyParser.json())
app.post('/', (req, res) => {
  if (!Object.keys(req.body).length) res.status(400).end('The request was not JSON formated or was empty')
  res.end('done')
})
app.use((err, req, res, next) => console.log(err))
app.listen(80)
const test = Testing('/')
const createTest = Testing.createTest
test([
  createTest(true, 'good request', { test: 'test' }),
  createTest(false, 'bad request', 'not json'),
  createTest(true, 'good request, good answer', { test: 'test' }, 'done'),
  createTest(false, 'bad request, bad answer', 'not json', 'done')
]).catch(err => {
  console.error(err.message)
  const expected = `Expected values to be strictly deep-equal:
\u001b[32m+ actual\u001b[39m \u001b[31m- expected\u001b[39m

\u001b[32m+\u001b[39m 'The request was not JSON formated or was empty'
\u001b[31m-\u001b[39m 'done'`
  if (err.message !== expected) {
    log('test failure', `TESTS FAILURE:
      expected: ${expected}
      received: ${err.message}`)
    process.exit(1)
  }
  return test(createTest(false, 'succeeded when expected to fail', { test: 'test' }))
    .catch(err => {
      console.error(err.message)
      const expected = 'The previous request succeeded whereas it should have failed'
      if (err.message !== expected) {
        log('test failure', `TESTS FAILURE:
          expected: ${expected}
          received: ${err.message}`)
        process.exit(1)
      }
      return test(createTest(true, 'failed when expected to succeed', 'not json'))
        .catch(err => {
          console.error(err.message)
          const expected = 'The previous request failed whereas it should have succeeded'
          if (err.message !== expected) {
            log('test failure', `TESTS FAILURE:
            expected: ${expected}
            received: ${err.message}`)
            process.exit(1)
          }
        })
    })
}).then(() => log('test successful', 'TESTS SUCCESSFUL')).finally(process.exit)
