import { projects } from "./projects";

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

function markTaskCompleted(activeTab, index) {
    if (projects[activeTab].tasks[index].completed === true) {
        projects[activeTab].tasks[index].completed = false;
    } else {
        projects[activeTab].tasks[index].completed = true;
    }
}

export {
    task,
    markTaskCompleted
};