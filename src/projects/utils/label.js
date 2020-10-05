const listLabelOnIssue = async (context) => {
  const owner = context.payload.repository.owner.login
  const repo = context.payload.repository.name
  const issueNumber = context.payload.issue.number
  return context.github.issues.listLabelsOnIssue({owner, repo, issue_number: issueNumber})
}

module.exports = {
  listLabelOnIssue,
}