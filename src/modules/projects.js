const projects = [];
const homeProject = project("Home");
projects.push(homeProject);

function project(title) {
    const tasks = [];
    const addTask = (task) => tasks.push(task) - 1;
    const deleteTask = (taskIndex) => tasks.splice(taskIndex, 1);

    return {
        title,
        tasks,
        addTask,
        deleteTask
    }
}

function createNewProject(title) {
    const newProject = project(title);
    return projects.push(newProject) - 1;
}

export {
    homeProject,
    createNewProject,
};