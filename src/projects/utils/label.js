const listLabelOnIssue = async (context) => {
  const owner = context.payload.repository.owner.login
  const repo = context.payload.repository.name
  const issueNumber = context.payload.issue.number
  const result = await context.github.issues.listLabelsOnIssue({owner, repo, issue_number: issueNumber})
  return result.data
}

module.exports = {
  listLabelOnIssue,
}