const commentUtils = require('../../src/projects/utils/comment')

describe('comment utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('check content cib', () =>{
    test('when comment content /cib return true', () => {
      const result = commentUtils.checkContentCib('/cib')
      expect(result).toBe(true)
    })
    test('when comment  no content /cib return false', () => {
      const result = commentUtils.checkContentCib('truc')
      expect(result).toBe(false)
    })
  }) 
})