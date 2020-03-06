const getProjectKanban = (context) => {
    return new Promise((resolve, reject) => {
        const owner = context.payload.repository.owner.login
        const repo = context.payload.repository.name
        context.github.projects.listForRepo({owner, repo, state: 'open'})
        .then( res => {
            const kanban = res.data.filter(project => project.name === 'kanban automatic')
            kanban.length >= 1 ? resolve(kanban[0]) : reject('nothing kanban')
        })
        .catch(err => {
            reject(err)
        })
    })
}

const getColumn = (context, project, name) => {
    return new Promise((resolve, reject) => {
        context.github.projects.listColumns({project_id: project.id})
        .then(resColumns => {
            const columns = resColumns.data.filter(column => column.name === name)
            columns.length >= 1 ? resolve(columns[0]) : reject('no columns')
        })
        .catch(err => reject(err))
    })
}

const getCard = (context, project, columnName, issueNumber) => {
    return new Promise((resolve, reject) => {
        getColumn(context, project, columnName)
        .then(column => {
            context.github.projects.listCards({column_id: column.id, archived_state: 'not_archived'})
            .then(cards => {
                const card = cards.data.find(card => {
                    const issueNumberCard = card.content_url.slice(card.content_url.lastIndexOf('/')+ 1, card.content_url.length)
                    return issueNumberCard == issueNumber
                })
                if(card === undefined){
                    reject('card not found')
                }
                context.github.projects.getCard({card_id: card.id})
                .then(resCard => {
                    resolve(resCard.data)
                }).catch(err => reject(err))
            })
        })
    })
}

module.exports = {
    getProjectKanban,
    getColumn,
    getCard
}