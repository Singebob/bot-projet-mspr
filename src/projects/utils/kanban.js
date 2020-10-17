const getProjectKanban = async (context) => {
  const owner = context.payload.repository.owner.login
  const repo = context.payload.repository.name
  const projects = await context.github.projects.listForRepo({ owner, repo, state: 'open' })
  const kanban = projects.data.filter(project => project.name === 'kanban automatic')
  if(kanban.length >= 1)
    return kanban[0]
  throw Error("Project not found")
}

const getColumn = async (context, project, name) => {
  const columns = await context.github.projects.listColumns({ project_id: project.id })
  const columnsWithName = columns.data.filter(column => column.name === name)
  if (columnsWithName.length >= 1)
    return columnsWithName[0]
  throw Error('column not found')
}

const getCard = (context, project, columnName, issueNumber) => {
  return new Promise((resolve, reject) => {
    getColumn(context, project, columnName)
      .then(column => {
        context.github.projects.listCards({ column_id: column.id, archived_state: 'not_archived' })
          .then(cards => {
            const card = cards.data.find(card => {
              const issueNumberCard = card.content_url.slice(card.content_url.lastIndexOf('/') + 1, card.content_url.length)
              return issueNumberCard == issueNumber
            })
            if (card === undefined) {
              reject('card not found')
            }
            context.github.projects.getCard({ card_id: card.id })
              .then(resCard => {
                resolve(resCard.data)
              }).catch(err => reject(err))
          })
      })
  })
}

const moveCard = async (context, fromColumn, targetColumn, issueNumber) => {
  const project = await getProjectKanban(context)
  const column = await getColumn(context, project, targetColumn)
  const card = await getCard(context, project, fromColumn, issueNumber)
  await context.github.projects.moveCard({ position: 'top', column_id: column.id, card_id: card.id })
}

module.exports = {
  getProjectKanban,
  getColumn,
  getCard,
  moveCard,
}
