const pullRequestUtils = require('../../src/projects/utils/pullRequest')
const brancheUtils = require('../../src/projects/utils/branche')

describe('pull request utils', () => {
  describe('link PR with issue', () => {
    test('should link PR with issue', async () => {
      brancheUtils.getIssueNumberFromBrancheName = jest.fn(() => 21)
      const context = {
        payload: {
          repository: {
            name: 'botProjet',
            owner: {
              login: 'Singebob',
            }
          },
          pull_request: {
            number: 21,
            head: {
              ref: 'feature/21/aled'
            },
          }
        },
        github: {
          pulls: {
            update: jest.fn()
          }
        }
      }
      await pullRequestUtils.linkPullRequestWithIssue(context)
      expect(brancheUtils.getIssueNumberFromBrancheName).toHaveBeenCalled()
      expect(context.github.pulls.update).toHaveBeenCalled()
    })

    test('when branche utils throw not called pull update', async () => {
      brancheUtils.getIssueNumberFromBrancheName = jest.fn(() => {throw Error('msg')})
      const context = {
        payload: {
          repository: {
            name: 'botProjet',
            owner: {
              login: 'Singebob',
            }
          },
          pull_request: {
            number: 21,
            head: {
              ref: 'feature/21/aled'
            },
          }
        },
        github: {
          pulls: {
            update: jest.fn()
          }
        }
      }
      try {
        await pullRequestUtils.linkPullRequestWithIssue(context)
      } catch(err) {
      expect(brancheUtils.getIssueNumberFromBrancheName).toHaveBeenCalled()
      expect(context.github.pulls.update).not.toHaveBeenCalled()
      }
    })
  })
})
