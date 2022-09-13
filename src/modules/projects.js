const projectsHandler = {
    items: [],
    projectIdCount: 0,
    addProject: function (project) {
        return this.items.push(project) - 1;
    },
    removeProject: function (index) {
        return this.items.splice(index, 1);
    },
    init: function () {
        // Get the highest project's ID to continue from that value
        this.projectIdCount = this.items.reduce((highest, curr) => {
            return (curr.id > highest) ? curr.id : highest;
        }, 0);
    }
};

function project(id, title) {
    return {
        id,
        title
    }
}

function createNewProject(title) {
    projectsHandler.projectIdCount++;
    const newProject = project(projectsHandler.projectIdCount, title);
    const newProjectIndex = projectsHandler.addProject(newProject);
    return newProjectIndex;
}


export {
    createNewProject,
    projectsHandler
};