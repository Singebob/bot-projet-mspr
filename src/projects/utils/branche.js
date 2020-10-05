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
  const branchesName = branches.find(branche => branche.label == label.data[0].name)
  return branchesName.prefix
}

const createBranch = async (context, prefix) => {
  const owner = context.payload.repository.owner.login
  const repo = context.payload.repository.name
  const defaultBranch = context.payload.repository.default_branch
  const resMaster = await context.github.git.getRef({owner, repo, ref: `heads/${defaultBranch}`})
  const masterSha = resMaster.data.object.sha
  const name = context.payload.issue.title.toLowerCase().replace(/\s+/g,'_')
  const ref = `refs/heads/${prefix}/${context.payload.issue.number}/${name}`
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