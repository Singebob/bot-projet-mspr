const { getProjectKanban, getColumn, getCard } = require('./projects/kanban')
const issue_utils = require('./projects/utils/issues')
/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')

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

  app.on('issues.opened', async (context) => {
    try {
      await issue_utils.addCommentToIssue(context, 'Thanks for opening this issue!')
      await issue_utils.registerIssueToKanban(context)
    } catch (error) {
      console.error(error)
    }
  })

  app.on('issue_comment.created', context => {
    if (context.payload.comment.body === '/cib') {
      const owner = context.payload.repository.owner.login
      const repo = context.payload.repository.name
      const issueNumber = context.payload.issue.number
      const assignees = context.payload.comment.user.login
      context.github.issues.addAssignees({owner, repo, issue_number: issueNumber, assignees})
      context.github.issues.listLabelsOnIssue({owner, repo, issue_number: issueNumber})
      .then(resLabels => {
        if(resLabels.data.length < 1){
          const issueComment = context.issue({ body: " ¯\\\\\\_(ツ)\\_/¯ Impossible to create a branch ¯\\\\\\_(ツ)\\_/¯ "})
          context.github.issues.createComment(issueComment)
          return 0
        }
        branches.some(branche => {
          const label = resLabels.data.find(label => label.name === branche.label)
          if(label !== undefined){
            context.github.git.getRef({owner, repo, ref: 'heads/master'})
            .then(resMaster => {
              const masterSha = resMaster.data.object.sha
              const name = context.payload.issue.title.toLowerCase().replace(/\s+/g,'_')
              const ref = `refs/heads/${branche.prefix}/${issueNumber}/${name}`
              context.github.git.createRef({owner, repo, ref, sha: masterSha})
            })
            getProjectKanban(context)
            .then(kanban => {
              Promise.all([getColumn(context, kanban, 'In progress'), getCard(context, kanban, 'To do', issueNumber)])
              .then(([column, card]) => {
                context.github.projects.moveCard({position: 'top', column_id: column.id, card_id: card.id})
              })
            }).catch(err => {
              app.log.error(err)
            })
            return true
          }
          branches.some(branche => {
            const label = resLabels.data.find(label => label.name === branche.label)
            if (label !== undefined) {
              context.github.git.getRef({ owner, repo, ref: 'heads/master' })
                .then(resMaster => {
                  const masterSha = resMaster.data.object.sha
                  const name = context.payload.issue.title.toLowerCase().replace(/\s+/g, '_')
                  const ref = `refs/heads/${branche.prefix}/${issueNumber}/${name}`
                  context.github.git.createRef({ owner, repo, ref, sha: masterSha }).then(() => {
                    const issueComment = context.issue({ body: "Thanks for taking this issue! I created a branch"})
                    context.github.issues.createComment(issueComment)
                  })
                })
              return true
            }
          })
        })
      })
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
