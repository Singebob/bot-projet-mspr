const nock = require('nock')
// Requiring our app implementation
const myProbotApp = require('../src')
const { Probot } = require('probot')
// Requiring our fixtures
const payloadIssueOpen = require('./fixtures/issues.opened')
const payloadCommentOpen = require('./fixtures/comment.opened')
const fs = require('fs')
const path = require('path')
const utils = require('../src/projects/utils/kanban')
const issueUtils = require('../src/projects/utils/issues')
const commentUtils = require('../src/projects/utils/comment')
const labelUtils = require('../src/projects/utils/label')
const branchUtils = require('../src/projects/utils/branche')
const { resolve } = require('path')
const kanban = require('../src/projects/utils/kanban')
const { findBrancheName } = require('../src/projects/utils/branche')


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
      await probot.receive({ name: 'issues', payload: payloadIssueOpen })
      expect(issueUtils.addCommentToIssue).toHaveBeenCalled();
      expect(issueUtils.registerIssueToKanban).toHaveBeenCalled();
    })

    test('when add comment throw error register is not call', async () => {
      issueUtils.addCommentToIssue = jest.fn(() => {throw Error('test')})
      issueUtils.registerIssueToKanban = jest.fn()
      await probot.receive({name: 'issues', payload: payloadIssueOpen})
      expect(issueUtils.addCommentToIssue).toThrowError()
      expect(issueUtils.registerIssueToKanban).not.toHaveBeenCalled()
    })

    test('when register issue to kanban throw error check add comment is call', async () => {
      issueUtils.addCommentToIssue = jest.fn()
      issueUtils.registerIssueToKanban = jest.fn(() => {throw Error('test')})
      await probot.receive({name: 'issues', payload: payloadIssueOpen})
      expect(issueUtils.addCommentToIssue).toHaveBeenCalled()
      expect(issueUtils.registerIssueToKanban).toThrowError()
    })

  })

  describe('When comment is add on issue', () => {
    test('when comment content cib', async () => {
      commentUtils.checkContentCib = jest.fn(() => true)
      issueUtils.assigneUser = jest.fn()
      labelUtils.listLabelOnIssue = jest.fn(() => ['1'])
      branchUtils.findBrancheName = jest.fn()
      branchUtils.createBranch = jest.fn()
      kanban.moveCard = jest.fn()
      issueUtils.addCommentToIssue = jest.fn()
      await probot.receive({name: 'issue_comment', payload: payloadCommentOpen})
      expect(issueUtils.assigneUser).toHaveBeenCalled()
      expect(labelUtils.listLabelOnIssue).toHaveBeenCalled()
      expect(branchUtils.findBrancheName).toHaveBeenCalled()
      expect(branchUtils.createBranch).toHaveBeenCalled()
      expect(kanban.moveCard).toHaveBeenCalled()
      expect(issueUtils.addCommentToIssue).toHaveBeenCalled()
    })

    test('when comment no content cib', async () => {
      commentUtils.checkContentCib = jest.fn(() => false)
      issueUtils.assigneUser = jest.fn()
      labelUtils.listLabelOnIssue = jest.fn(() => ['1'])
      branchUtils.findBrancheName = jest.fn()
      branchUtils.createBranch = jest.fn()
      kanban.moveCard = jest.fn()
      issueUtils.addCommentToIssue = jest.fn()
      await probot.receive({name: 'issue_comment', payload: payloadCommentOpen})
      expect(issueUtils.assigneUser).not.toHaveBeenCalled()
      expect(labelUtils.listLabelOnIssue).not.toHaveBeenCalled()
      expect(branchUtils.findBrancheName).not.toHaveBeenCalled()
      expect(branchUtils.createBranch).not.toHaveBeenCalled()
      expect(kanban.moveCard).not.toHaveBeenCalled()
      expect(issueUtils.addCommentToIssue).not.toHaveBeenCalled()
    })

    test('when assigne user throw don\'t create branche', async () => {
      issueUtils.assigneUser = jest.fn(() => {throw Error('error')})
      commentUtils.checkContentCib = jest.fn(() => true)
      labelUtils.listLabelOnIssue = jest.fn(() => ['1'])
      branchUtils.findBrancheName = jest.fn()
      branchUtils.createBranch = jest.fn()
      kanban.moveCard = jest.fn()
      await probot.receive({name: 'issue_comment', payload: payloadCommentOpen})
      expect(issueUtils.assigneUser).toHaveBeenCalled()
      expect(labelUtils.listLabelOnIssue).not.toHaveBeenCalled()
      expect(branchUtils.findBrancheName).not.toHaveBeenCalled()
      expect(branchUtils.createBranch).not.toHaveBeenCalled()
      expect(kanban.moveCard).not.toHaveBeenCalled()
      expect(issueUtils.addCommentToIssue).not.toHaveBeenCalled()
    })

    test('when issue don\'t have label don\t create branche', async () => {
      commentUtils.checkContentCib = jest.fn(() => true)
      issueUtils.assigneUser = jest.fn()
      labelUtils.listLabelOnIssue = jest.fn(() => [])
      branchUtils.findBrancheName = jest.fn()
      branchUtils.createBranch = jest.fn()
      kanban.moveCard = jest.fn()
      issueUtils.addCommentToIssue = jest.fn()
      await probot.receive({name: 'issue_comment', payload: payloadCommentOpen})
      expect(issueUtils.assigneUser).toHaveBeenCalled()
      expect(labelUtils.listLabelOnIssue).toHaveBeenCalled()
      expect(branchUtils.findBrancheName).not.toHaveBeenCalled()
      expect(branchUtils.createBranch).not.toHaveBeenCalled()
      expect(kanban.moveCard).not.toHaveBeenCalled()
      expect(issueUtils.addCommentToIssue).toHaveBeenCalled()
    })

  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
