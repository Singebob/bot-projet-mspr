const nock = require('nock')
// Requiring our app implementation
const myProbotApp = require('../src')
const { Probot } = require('probot')
// Requiring our fixtures
const payload = require('./fixtures/issues.opened')
const issueCreatedBody = { body: 'Thanks for opening this issue!' }
const fs = require('fs')
const path = require('path')
const utils = require('../src/projects/utils/kanban')
const issueUtils = require('../src/projects/utils/issues')
const { resolve } = require('path')


describe('My Probot app', () => {
  let probot
  let mockCert

  beforeAll((done) => {
    fs.readFile(path.join(__dirname, 'fixtures/mock-cert.pem'), (err, cert) => {
      if (err) return done(err)
      mockCert = cert
      done()
    })
  })

  beforeEach(() => {
    jest.clearAllMocks();
    nock.disableNetConnect()
    probot = new Probot({ id: 123, cert: mockCert })
    // Load our app into probot
    probot.load(myProbotApp)
  })
  describe('When issue is opened', () => {

    test('creates a comment when an issue is opened', async () => {
      issueUtils.addCommentToIssue = jest.fn()
      issueUtils.registerIssueToKanban = jest.fn()
      // Receive a webhook event
      await probot.receive({ name: 'issues', payload })
      expect(issueUtils.addCommentToIssue).toHaveBeenCalled();
      expect(issueUtils.registerIssueToKanban).toHaveBeenCalled();
    })

    test('when add comment throw error register is not call', async () => {
      issueUtils.addCommentToIssue = jest.fn(() => {throw Error('test')})
      issueUtils.registerIssueToKanban = jest.fn()
      await probot.receive({name: 'issues', payload})
      expect(issueUtils.addCommentToIssue).toThrowError()
      expect(issueUtils.registerIssueToKanban).not.toHaveBeenCalled()
    })

    test('when register issue to kanban throw error check add comment is call', async () => {
      issueUtils.addCommentToIssue = jest.fn()
      issueUtils.registerIssueToKanban = jest.fn(() => {throw Error('test')})
      await probot.receive({name: 'issues', payload})
      expect(issueUtils.addCommentToIssue).toHaveBeenCalled()
      expect(issueUtils.registerIssueToKanban).toThrowError()
    })

  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
