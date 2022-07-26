import { homeProject } from "./projects.js";
import { task } from "./tasks.js";

const sidebar = document.getElementsByClassName("sidebar")[0];
const sidebarItems = sidebar.getElementsByClassName("sidebar_item");

const workspaceTitle = document.getElementsByClassName("workspace_title")[0];
const workspaceContent = document.getElementById("tasks");
const newTaskContainer = document.getElementsByClassName("n-task")[0];

const home = sidebarItems[0].addEventListener("click", switchSidebarTab);
const today = sidebarItems[1].addEventListener("click", switchSidebarTab);
const thisWeek = sidebarItems[2].addEventListener("click", switchSidebarTab);

const icons = {
    details: `<svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"></path></svg>`,
    edit: `<svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path></svg>`,
    delete: `<svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"></path></svg>`,
}


function switchSidebarTab(e) {
    // Get sidebar elements which have the 'active' class and remove it
    const activeElements = sidebar.getElementsByClassName("sidebar_item active");
    for (let item of activeElements) {
        item.classList.remove("active");
    }

    e.currentTarget.classList.add("active");

    updateProjectWorkspace(e.currentTarget.innerText);
}

function updateProjectWorkspace(title) {
    if (workspaceTitle) {
        workspaceTitle.textContent = title;
    }

    workspaceContent.innerHTML = "";

    switch (title) {
        case "Home":
            newTaskContainer.classList.add("active");
            renderTasks();
            break;
        case "Today":
            newTaskContainer.classList.remove("active");
            break;
        case "This Week":
            newTaskContainer.classList.remove("active");
            break;
    }
}

function renderTasks() {
    const fragment = document.createDocumentFragment();

    homeProject.tasks.forEach((task, index) => {
        const taskNode = createTaskUI(task.title, task.details, task.date, task.priority, task.completed, index);
        fragment.prepend(taskNode);
    });

    workspaceContent.prepend(fragment);
}




// ----------------- Tasks ----------------- //
function createTaskUI(title, details, date, priority, completed, index) {
    const container = document.createElement("div");
    const checkbox = document.createElement("input");
    const taskTitle = document.createElement("div");
    const taskActions = document.createElement("div");
    const editTaskBtn = document.createElement("button");
    const deleteTaskBtn = document.createElement("button");
    const taskDate = document.createElement("div");

    container.classList.add("task");
    taskTitle.classList.add("task_title");
    taskActions.classList.add("task_actions");
    taskDate.classList.add("task_date");

    checkbox.type = "checkbox";
    editTaskBtn.type = "button";
    deleteTaskBtn.type = "button";

    taskTitle.textContent = title;
    taskDate.textContent = date;
    editTaskBtn.innerHTML = icons.edit;
    deleteTaskBtn.innerHTML = icons.delete;

    container.dataset.taskIndex = index;
    editTaskBtn.dataset.taskAction = "edit";
    deleteTaskBtn.dataset.taskAction = "delete";

    taskActions.append(editTaskBtn, deleteTaskBtn);

    if (details) {
        const taskDetails = document.createElement("div");
        const taskDetailsBtn = document.createElement("button");

        taskDetails.classList.add("task_details");
        taskDetails.textContent = details;

        taskDetailsBtn.type = "button";
        taskDetailsBtn.innerHTML = icons.details;

        taskTitle.append(taskDetailsBtn);
        container.append(checkbox, taskTitle, taskDetails, taskActions, taskDate);
    } else {
        container.append(checkbox, taskTitle, taskActions, taskDate);
    }

    if (priority) {
        switch (priority) {
            case "low":
                container.classList.add("low-priority");
                break;
            case "medium":
                container.classList.add("medium-priority");
                break;
            case "high":
                container.classList.add("high-priority");
        }
    }

    if (completed === true) {
        checkbox.checked = true;
        container.classList.toggle("completed");
    }

    return container;
}

// Test data
homeProject.addTask(task("Terminar modelado",
    "asdasdadsadsa",
    "date",
    "high"));
homeProject.addTask(task("Terminar modelado - 2",
    "asdasdadsadsa",
    "date",
    "medium"));
homeProject.addTask(task("Terminar modelado - 4",
    "asdasdadsadsa",
    "date",
    "low"));