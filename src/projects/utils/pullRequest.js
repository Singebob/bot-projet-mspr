const brancheUtils = require('./branche')

const linkPullRequestWithIssue = (context) => {
  const issueNumber = brancheUtils.getIssueNumberFromBrancheName(context.payload.pull_request.head.ref)
  const owner = context.payload.repository.owner.login
  const repo = context.payload.repository.name
  const pull_number = context.payload.pull_request.number
  const body = `resolves #${issueNumber}`
  context.github.pulls.update({owner, repo, pull_number, body})
}

module.exports = {
  linkPullRequestWithIssue,
}