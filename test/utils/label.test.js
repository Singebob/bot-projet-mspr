const labelUtils = require('../../src/projects/utils/label')

describe('label util', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  describe('get label on issue', () => {
    test('should return labels on issue', async () => {
      const context = {
        payload: {
          repository: {
            name: 'botProjet',
            owner: {
              login: 'Singebob',
            }
          },
          issue: {
            number: 21,
          }
        },
        github: {
          issues: {
            listLabelsOnIssue: jest.fn(() => [{name: 'label'}])
          }
        }
      }
      const result = await labelUtils.listLabelOnIssue(context)
      expect(result).toEqual([{name: 'label'}])
    })
  })
})
