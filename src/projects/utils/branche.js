const branches = [
  {
    label: 'breakingchange',
    prefix: 'breakingchange'
  },
  {
    label: 'enhancement',
    prefix: 'feature'
  },
  {
    label: 'bug',
    prefix: 'fix'
  },
  {
    label: 'ci',
    prefix: 'ci'
  },
  {
    label: 'documentation',
    prefix: 'doc'
  }
]

const findBrancheName = (label) => {
  const branchesName = branches.find(branche => branche.label == label.name)
  return branchesName[0].prefix
}

const createBranch = async (context, prefix) => {
  await context.github.git.getRef({owner, repo, ref: 'heads/master'})
  const masterSha = resMaster.data.object.sha
  const name = context.payload.issue.title.toLowerCase().replace(/\s+/g,'_')
  const ref = `refs/heads/${prefix}/${issueNumber}/${name}`
  await context.github.git.createRef({owner, repo, ref, sha: masterSha})
}

const getIssueNumberFromBrancheName =(branchName) => {
  const firstSlash = branchName.indexOf('/')
  const lastSlash = branchName.lastIndexOf('/')
  return branchName.slice(firstSlash + 1, lastSlash)
}

module.exports = {
  findBrancheName,
  createBranch,
  getIssueNumberFromBrancheName,
}