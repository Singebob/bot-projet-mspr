const getProjectKanban = context => {
    return new Promise((resolve, reject) => {
        context.github.projects.listForRepo({owner, repo, state: 'open'})
        .then( res => {
            const kanban = res.data.filter(project => project.name === 'kanban automatic')
            kanban.length >= 1 ? resolve(kanban) : reject('nothing kanban')
        })
        .catch(err => {
            reject(err)
        })
    })
}