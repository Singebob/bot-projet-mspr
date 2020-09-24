const { getProjectKanban, getColumn, getCard } = require('./projects/utils/kanban')
const issueUtils = require('./projects/utils/issues')
const labelUtils = require('./projects/utils/label')
const branchUtils = require('./projects/utils/branche')
const kanban = require('./projects/utils/kanban')
const commentUtils = require('./projects/utils/comment')
/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')


  app.on('issues.opened', async (context) => {
    try {
      await issueUtils.addCommentToIssue(context, 'Thanks for opening this issue!')
      await issueUtils.registerIssueToKanban(context)
    } catch (error) {
      console.error(error)
    }
  })

  app.on('issue_comment.created', async (context) => {
    try {
      if (commentUtils.checkContentCib(context.payload.comment.body)) {
        await issueUtils.assigneUser(context, context.payload.comment.user.login)      
        const labelsOnIssue = labelUtils.listLabelOnIssue(context)
        if(labelsOnIssue < 1) {
          issueUtils.addCommentToIssue(context, " ¯\\\\\\_(ツ)\\_/¯ Impossible to create a branch ¯\\\\\\_(ツ)\\_/¯ ")
          return 0
        }
        const prefixBrancName = await branchUtils.findBrancheName(context, labelsOnIssue)
        await branchUtils.createBranch(context, prefixBrancName)
        await kanban.moveCard(context, 'To do', 'In progress', context.payload.issue.number)
        await issueUtils.addCommentToIssue(context, 'Thanks for taking this issue! I created a branch')
      }
    } catch (error) {
      console.log(error)
    }
  })

  app.on('pull_request.opened', context => {
    const branchName = context.payload.pull_request.head.ref
    const firstSlash = branchName.indexOf('/')
    const lastSlash = branchName.lastIndexOf('/')
    const issueNumber = branchName.slice(firstSlash + 1, lastSlash)

    const owner = context.payload.repository.owner.login
    const repo = context.payload.repository.name
    const pull_number = context.payload.pull_request.number
    const body = `resolves #${issueNumber}`
    context.github.pulls.update({owner, repo, pull_number, body})

    getProjectKanban(context)
    .then(kanban => {
      Promise.all([getColumn(context, kanban, 'Review in progress'), getCard(context, kanban, 'In progress', issueNumber)])
      .then(([column, card]) => {
        context.github.projects.moveCard({position: 'top', column_id: column.id, card_id: card.id})
      })
      .catch(err => {
        app.log.error(err)
      })
    })
  })

  app.on('pull_request_review.submitted', context => {
    app.log('pull_request_review', context.payload)
    const branchName = context.payload.pull_request.head.ref
    const firstSlash = branchName.indexOf('/')
    const lastSlash = branchName.lastIndexOf('/')
    const issueNumber = branchName.slice(firstSlash + 1, lastSlash)

    getProjectKanban(context)
    .then(kanban => {
      Promise.all([getColumn(context, kanban, 'Reviewer approved'), getCard(context, kanban, 'Review in progress', issueNumber)])
      .then(([column, card]) => {
        context.github.projects.moveCard({position: 'top', column_id: column.id, card_id: card.id})
      })
      .catch(err => {
        app.log.error(err)
      })
    })
  })

}
