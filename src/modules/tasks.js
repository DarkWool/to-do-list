import { homeProject } from "./projects";

// Factory function to create new tasks
function task(title, details, date, priority, completed = false) {
    return {
        title,
        details,
        date,
        priority,
        getInfo: () => console.log(`${title} - ${details} - ${date} - ${priority} - ${completed}`),
        get completed() {
            return completed;
        },
        set completed(value) {
            if (value === true || value === false) {
                completed = value;
            }
        }
    }
}

function markTaskCompleted(index) {
    if (homeProject.tasks[index].completed === true) {
        homeProject.tasks[index].completed = false;
    } else {
        homeProject.tasks[index].completed = true;
    }
}

export {
    task,
    markTaskCompleted
};