// Factory function to create new tasks
function task(title, details, date, priority) {    
    let completed = false;

    return {
        title,
        details,
        date,
        priority,
        toggleCompletedState() {
            completed = (completed) ? false : true;
        },
        get completed() {
            return completed;
        },
    }
}

export {
    task
};