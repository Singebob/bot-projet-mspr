const { getProjectKanban, getColumn, getCard } = require('./projects/utils/kanban')
const issueUtils = require('./projects/utils/issues')
const labelUtils = require('./projects/utils/label')
const branchUtils = require('./projects/utils/branche')
const kanban = require('./projects/utils/kanban')
const commentUtils = require('./projects/utils/comment')
const pullRequestUtils = require('./projects/utils/pullRequest')
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

  app.on('pull_request.opened', async (context) => {
    try {
      await pullRequestUtils.linkPullRequestWithIssue(context)
      const issueNumber = await branchUtils.getIssueNumberFromBrancheName(context.payload.pull_request.head.ref)
      await kanban.moveCard(context, 'In progress', 'Review in progress', issueNumber)
    } catch (error) {
      console.error(error)
    }
  })
}
