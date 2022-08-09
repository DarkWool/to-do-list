import { format, isToday, isThisWeek } from "date-fns";
import { homeProject, projects } from "../projects.js";
import { task, markTaskCompleted } from "../tasks.js";
import { activeTab } from "./projects.js";

const currTaskInfo = {
    index: null,
    project: null,
};


// Dom cache
const newTaskBtn = document.getElementsByClassName("n-task_btn")[0];
const tasksContainer = document.getElementById("tasks");

const taskModals = document.getElementsByClassName("task-modal");
const newTaskModal = taskModals[0];
const editTaskModal = taskModals[1];
const newTaskForm = document.getElementById("newTaskForm");
const editTaskForm = document.getElementById("editTaskForm");
const darkOverlay = document.getElementsByClassName("dark-overlay")[0];

// Event Listeners
newTaskBtn.addEventListener("click", () => openModal(newTaskModal));
newTaskForm.addEventListener("submit", getNewTaskData);
editTaskForm.addEventListener("submit", editTask);
darkOverlay.addEventListener("click", () => {
    for (let modal of taskModals) {
        closeModal(modal);
    }
});

for (let modal of taskModals) {
    const closeBtn = modal.getElementsByClassName("close-modal-btn")[0];
    closeBtn.addEventListener("click", (e) => {
        const modal = e.currentTarget.closest(".task-modal");
        closeModal(modal);
    });
}

const icons = {
    edit: `<svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path></svg>`,
    delete: `<svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"></path></svg>`,
}

// Functions
function composeNewTask(title, details, date, priority) {
    const newTask = task(title, details, date, priority);
    const newTaskIndex = projects[activeTab].addTask(newTask);

    closeModal(newTaskModal);

    tasksContainer.prepend(createTaskUI(newTask, newTaskIndex));
}

function createTaskUI(task, index, projectIndex) {
    const container = document.createElement("div");
    const checkbox = document.createElement("input");
    const taskTitle = document.createElement("div");
    const taskActions = document.createElement("div");
    const editTaskBtn = document.createElement("button");
    const deleteTaskBtn = document.createElement("button");
    const taskDate = document.createElement("div");

    const formattedDate = format(task.date, "E MMM dd, yyyy");

    container.classList.add("task");
    taskTitle.classList.add("task_title");
    taskActions.classList.add("task_actions");
    taskDate.classList.add("task_date");

    checkbox.type = "checkbox";
    editTaskBtn.type = "button";
    deleteTaskBtn.type = "button";

    taskTitle.textContent = task.title;
    taskDate.textContent = formattedDate;
    editTaskBtn.innerHTML = icons.edit;
    deleteTaskBtn.innerHTML = icons.delete;

    container.dataset.taskIndex = index;
    editTaskBtn.dataset.taskAction = "edit";
    deleteTaskBtn.dataset.taskAction = "delete";
    
    if (projectIndex != null) {
        container.dataset.projectIndex = projectIndex;
    }

    taskActions.append(editTaskBtn, deleteTaskBtn);

    if (task.details) {
        const taskDetails = document.createElement("div");
        const taskDetailsBtn = document.createElement("button");

        taskDetails.classList.add("task_details");
        taskDetailsBtn.classList.add("task_details-btn");
        taskDetails.textContent = task.details;

        taskDetailsBtn.type = "button";
        taskDetailsBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M7.41,8.58L12,
        13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"></path></svg>`;

        taskTitle.append(taskDetailsBtn);
        container.append(checkbox, taskTitle, taskDetails, taskActions, taskDate);
        createNewTaskListeners(checkbox, taskActions, taskDetailsBtn);
    } else {
        container.append(checkbox, taskTitle, taskActions, taskDate);
        createNewTaskListeners(checkbox, taskActions);
    }

    if (task.priority) {
        switch (task.priority) {
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

    if (task.completed === true) {
        checkbox.checked = true;
        container.classList.toggle("completed");
    }

    return container;
}

function createNewTaskListeners(checkbox, taskActions, detailsBtn) {
    checkbox.addEventListener("input", markTaskCompletedUI);

    taskActions.addEventListener("click", (e) => {
        const button = e.target.closest("button");
        if (button === null) return;

        const taskNode = button.closest("div.task");
        if (taskNode.dataset.projectIndex) {
            currTaskInfo.project = taskNode.dataset.projectIndex;
        } else {
            currTaskInfo.project = activeTab;
        }
        currTaskInfo.index = +taskNode.dataset.taskIndex;

        if (button.dataset.taskAction === "edit") {
            openModal(editTaskModal);
            setEditFormValues();
        } else if (button.dataset.taskAction === "delete") {
            deleteTask();
        }
    });

    if (detailsBtn) detailsBtn.addEventListener("click", showTaskDetails);
}

// Task actions functions
function markTaskCompletedUI(e) {
    const taskNode = e.currentTarget.closest("div.task");
    const taskIndex = taskNode.dataset.taskIndex;
    taskNode.classList.toggle("completed");

    if (taskNode.dataset.projectIndex) {
        return markTaskCompleted(taskNode.dataset.projectIndex, taskIndex);
    }

    markTaskCompleted(activeTab, taskIndex);
}

function showTaskDetails(e) {
    const taskNode = e.currentTarget.closest("div.task");
    const taskDetailsNode = taskNode.getElementsByClassName("task_details")[0];

    if (taskDetailsNode) {
        taskDetailsNode.classList.toggle("active");
        e.currentTarget.classList.toggle("rotate");
    }
}

function deleteTask() {
    // Delete task obj from project
    projects[currTaskInfo.project].deleteTask(currTaskInfo.index);

    renderTasks();
}

// Task forms functions
function openModal(modal) {
    if (modal) modal.classList.add("active");
    darkOverlay.classList.add("active");
}

function closeModal(modal) {
    if (modal) modal.classList.remove("active");
    darkOverlay.classList.remove("active");
}

function getNewTaskData(e) {
    // Do not let the form refresh the page
    e.preventDefault();

    const inputs = e.target.elements;
    const titleInput = inputs["taskTitle"];
    if (titleInput.value === "") return;

    const data = new FormData(e.currentTarget);
    const title = data.get("taskTitle");
    const details = data.get("taskDetails");
    const date = new Date(`${data.get("taskDate")} 00:00`);
    const priority = data.get("taskPriority");

    composeNewTask(title, details, date, priority);
}

function setEditFormValues() {
    let currTask = projects[currTaskInfo.project].tasks[currTaskInfo.index];

    const formFields = editTaskForm.elements;
    formFields["taskTitle"].value = currTask.title;
    formFields["taskDetails"].value = currTask.details;
    formFields["taskPriority"].value = currTask.priority;

    const date = format(currTask.date, "yyyy-MM-dd");
    formFields["taskDate"].value = date;
}

function editTask(e) {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const title = data.get("taskTitle");
    const details = data.get("taskDetails");
    const date = new Date(`${data.get("taskDate")} 00:00`);
    const priority = data.get("taskPriority");

    let currTask = projects[currTaskInfo.project].tasks[currTaskInfo.index];
    currTask.title = title;
    currTask.details = details;
    currTask.priority = priority;
    currTask.date = date;

    renderTasks();
    closeModal(editTaskModal);
}


function cleanTasks() {
    tasksContainer.innerHTML = "";
}

function renderTasks() {
    // Clean tasks
    tasksContainer.innerHTML = "";

    const fragment = document.createDocumentFragment();
    switch (activeTab) {
        case "Today":
            projects.forEach((project, projectIndex) => {
                project.tasks.forEach((task, index) => {
                    if (isToday(task.date)) {
                        const taskNode = createTaskUI(task, index, projectIndex);
                        fragment.prepend(taskNode);
                    }
                });
            });
            break;
        case "This Week":
            projects.forEach((project, projectIndex) => {
                console.log(projectIndex);
                project.tasks.forEach((task, index) => {
                    if (isThisWeek(task.date)) {
                        const taskNode = createTaskUI(task, index, projectIndex);
                        fragment.prepend(taskNode);
                    }
                });
            });
            break;
        default:
            projects[activeTab].tasks.forEach((task, index) => {
                const taskNode = createTaskUI(task, index);
                fragment.prepend(taskNode);
            });
    }

    tasksContainer.prepend(fragment);
}




// Test data
homeProject.addTask(task("Terminar modelado",
    "asdasdadsadsa",
    new Date("2022-07-24 00:00"),
    "high"));
homeProject.addTask(task("Terminar modelado - 1",
    `Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatum expedita at excepturi recusandae labore possimus unde dolorum molestias eligendi odit quibusdam doloremque repudiandae quia earum illum ullam maiores, asperiores pariatur. Sed, saepe ? Facere iure fugiat dolore magni, assumenda ullam dolorum, officiis accusantium dignissimos itaque beatae sed ratione saepe a, non molestias reprehenderit laborum error ? Aperiam neque magni in ea tempore. Eum laudantium maiores, id aperiam, dolore quam, facilis incidunt exercitationem labore dolorem sed non laborum repellendus ab distinctio maxime et vero enim ? Ex, rem hic voluptatum ad quisquam architecto nobis. Ex rerum porro error dolore, doloribus consequuntur, facilis quam quos iure ad tempora labore id explicabo laborum debitis ratione voluptate, nobis eos vero obcaecati quod distinctio eveniet provident.Nihil, doloremque ? 
    Aspernatur reiciendis aliquid rerum aliquam quas! Autem quod mollitia dicta placeat eveniet unde, consequuntur quis repellendus labore saepe cum laudantium dignissimos illo voluptate veritatis quo magnam ut sapiente porro nesciunt.`,
    new Date("2022-07-13 00:00"),
    "none"));
homeProject.addTask(task("Terminar modelado - 2",
    "asdasdadsadsa",
    new Date("2022-07-11 00:00"),
    "medium"));
homeProject.addTask(task("Terminar modelado - 3",
    null,
    new Date("2022-08-08 00:00"),
    "high"));
homeProject.addTask(task("Terminar modelado - today",
    "asdasdadsadsa",
    new Date("2022-08-09 00:00"),
    "low"));

export {
    renderTasks
};