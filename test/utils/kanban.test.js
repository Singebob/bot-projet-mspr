const kanbanUtils = require('../../src/projects/utils/kanban')

describe('kanban utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getProjectKanban', () =>{
    test('when all is fine', async () => {
      const context = {
        payload: {
          repository: {
            name: 'botProjet',
            owner: {
              login: 'Singebob',
            }
          }
        },
        github: {
          projects: {
            listForRepo: jest.fn(() => {return {data: [{name: 'kanban automatic'}]}})
          }
        }
      }
      const result = await kanbanUtils.getProjectKanban(context)
      expect(result).toEqual({name: 'kanban automatic'})
    })
    test('when kanban project not found', async () => {
      const context = {
        payload: {
          repository: {
            name: 'botProjet',
            owner: {
              login: 'Singebob',
            }
          }
        },
        github: {
          projects: {
            listForRepo: jest.fn(() => {return {data: [{name: 'kanban'}]}})
          }
        }
      }
      try {
        await kanbanUtils.getProjectKanban(context)
      } catch (error) {
        expect(error.message).toEqual('Project not found')
      }
    })
  })

  describe('getColumn', () => {
    test('all is fine', async () => {
      const context = {
        payload: {
          repository: {
            name: 'botProjet',
            owner: {
              login: 'Singebob',
            }
          }
        },
        github: {
          projects: {
            listColumns: jest.fn(() => {return {data: [{name: 'To do'}]}})
          }
        }
      }
      const result = await kanbanUtils.getColumn(context, {}, 'To do')
      expect(result).toEqual({name: 'To do'})
    })
    test('column not found on result', async () => {
      const context = {
        payload: {
          repository: {
            name: 'botProjet',
            owner: {
              login: 'Singebob',
            }
          }
        },
        github: {
          projects: {
            listColumns: jest.fn(() => {return {data: [{name: 'Doing'}]}})
          }
        }
      }
      try {
        await kanbanUtils.getColumn(context, {}, 'To do')
      } catch (error) {
        expect(error.message).toEqual('column not found') 
      }
    })
  })
})
