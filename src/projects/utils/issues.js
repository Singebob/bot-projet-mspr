const { getProjectKanban, getColumn } = require('./kanban')

const registerIssueToKanban =  async (context) => {
  try {
    const projectKanban = await getProjectKanban(context)
    const columnToDo = await getColumn(context, projectKanban, 'To do')
    await context.github.projects.createCard({
      column_id: columnToDo.id,
      content_type: 'Issue',
      content_id: context.payload.issue.id
    })
  } catch (error) {
    throw error;
  }
}

const addCommentToIssue = async (context, comment) => {
  try {
    await context.github.issues.createComment(context.issue({ body: comment }))
  } catch (error) {
    throw error
  }
}



module.exports = {
  registerIssueToKanban,
  addCommentToIssue,
}