const projects = [];
const homeProject = project("Home");

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

export {
    homeProject
};