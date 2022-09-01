import { format, isToday, isThisWeek, isValid } from "date-fns";
import { homeProject, projects } from "../projects.js";
import { task } from "../tasks.js";
import { activeTab } from "./projects.js";

const currTaskInfo = {
    index: null,
    project: null,
};


// Dom cache
const newTaskBtn = document.getElementsByClassName("n-task_btn")[0];
const tasksContainer = document.getElementById("tasks");

const taskModal = document.getElementsByClassName("task-modal")[0];
const taskModalTitle = taskModal.getElementsByClassName("task-modal_title")[0];
const modalCloseBtn = taskModal.getElementsByClassName("close-modal-btn")[0];
const newTaskForm = document.getElementById("newTaskForm");
const editTaskForm = document.getElementById("editTaskForm");
const newTaskTitle = document.getElementById("f-nTaskTitle");
const editTaskTitle = document.getElementById("f-eTaskTitle");
const darkOverlay = document.getElementsByClassName("dark-overlay")[0];

// Event Listeners
newTaskBtn.addEventListener("click", () => openModal("new"));
newTaskForm.addEventListener("submit", getNewTaskData);
editTaskForm.addEventListener("submit", editTask);
darkOverlay.addEventListener("click", closeModal);
modalCloseBtn.addEventListener("click", closeModal);
newTaskTitle.addEventListener("blur", detectMissingInput);
editTaskTitle.addEventListener("blur", detectMissingInput);

const icons = {
    edit: `<svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path></svg>`,
    delete: `<svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"></path></svg>`,
}


// Modal functions
function openModal(modalType) {
    resetForm();
    taskModal.classList.add("active");
    darkOverlay.classList.add("active");

    if (modalType === "new") {
        taskModalTitle.textContent = "New Task";
        newTaskForm.classList.add("active");
    } else {
        taskModalTitle.textContent = "Edit Task";
        editTaskForm.classList.add("active");
    }
}

function closeModal() {
    taskModal.classList.remove("active");
    darkOverlay.classList.remove("active");
}

// Functions for creating a new task
function getNewTaskData(e) {
    // Do not let the form refresh the page
    e.preventDefault();

    const titleInput = e.target.elements["f-nTaskTitle"];
    if (validateFormData(titleInput) === false) return;

    const data = new FormData(e.currentTarget);
    const title = data.get("f-nTaskTitle");
    const details = data.get("f-nTaskDetails");
    const priority = data.get("f-nTaskPriority");

    let date = new Date(`${data.get("f-nTaskDate")} 00:00`);
    if (isValid(date) === false) {
        date = null;
    }

    composeNewTask(title, details, date, priority);
    closeModal();
}

function composeNewTask(title, details, date, priority) {
    // If this is the first task of the project then clean the 'no tasks' message
    if (projects[activeTab].tasks[0] == null) cleanTasksContainer();

    const newTask = task(title, details, date, priority);
    const newTaskIndex = projects[activeTab].addTask(newTask);

    tasksContainer.prepend(createTaskUI(newTask, newTaskIndex));
}

function createTaskUI(task, taskIndex, projectIndex) {
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
    editTaskBtn.classList.add("icon-container");
    deleteTaskBtn.classList.add("icon-container");

    checkbox.type = "checkbox";
    editTaskBtn.type = "button";
    deleteTaskBtn.type = "button";

    taskTitle.textContent = task.title;
    editTaskBtn.innerHTML = icons.edit;
    deleteTaskBtn.innerHTML = icons.delete;

    if (task.date !== null) {
        taskDate.textContent = format(task.date, "E MMM dd, yyyy");
    } else {
        taskDate.textContent = "No Date";
    }

    editTaskBtn.dataset.taskAction = "edit";
    deleteTaskBtn.dataset.taskAction = "delete";
    

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
        createNewTaskListeners(taskIndex, projectIndex, checkbox, taskActions, taskDetailsBtn);
    } else {
        container.append(checkbox, taskTitle, taskActions, taskDate);
        createNewTaskListeners(taskIndex, projectIndex, checkbox, taskActions);
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

function createNewTaskListeners(taskIndex, projectIndex, checkbox, taskActions, detailsBtn) {
    // checkbox.addEventListener("input", markTaskCompletedUI);
    checkbox.addEventListener("input", (e) => {
        markTaskCompletedUI(e.target, taskIndex, projectIndex);
    });

    taskActions.addEventListener("click", (e) => {
        const button = e.target.closest("button");
        if (button === null) return;

        currTaskInfo.index = taskIndex;
        currTaskInfo.project = projectIndex;

        if (button.dataset.taskAction === "edit") {
            openModal("edit");
            setEditFormValues();
        } else if (button.dataset.taskAction === "delete") {
            deleteTask();
        }
    });

    if (detailsBtn) detailsBtn.addEventListener("click", showTaskDetails);
}

// Tasks actions functions
function markTaskCompletedUI(target, taskIndex, projectIndex) {
    const taskNode = target.closest("div.task");
    taskNode.classList.toggle("completed");

    projects[projectIndex].tasks[taskIndex].toggleCompletedState();
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

// Edit task
function setEditFormValues() {
    let currTask = projects[currTaskInfo.project].tasks[currTaskInfo.index];
    editTaskForm.reset();

    const formFields = editTaskForm.elements;
    formFields["f-eTaskTitle"].value = currTask.title;
    formFields["f-eTaskDetails"].value = currTask.details;
    formFields["f-eTaskPriority"].value = currTask.priority;

    if (currTask.date !== null) {
        let date = format(currTask.date, "yyyy-MM-dd");
        formFields["f-eTaskDate"].value = date;
    }
}

function editTask(e) {
    e.preventDefault();

    const titleInput = e.target.elements["f-eTaskTitle"];
    if (validateFormData(titleInput) === false) return;

    const data = new FormData(e.currentTarget);
    const title = data.get("f-eTaskTitle");
    const details = data.get("f-eTaskDetails");
    const priority = data.get("f-eTaskPriority");
    let date = new Date(`${data.get("f-eTaskDate")} 00:00`);

    let currTask = projects[currTaskInfo.project].tasks[currTaskInfo.index];
    currTask.title = title;
    currTask.details = details;
    currTask.priority = priority;

    // If the date is valid change the value of the task object
    if (isValid(date) === true) {
        currTask.date = date;
    } else {
        currTask.date = null;
    }

    renderTasks();
    closeModal();
}

function renderTasks() {
    cleanTasksContainer();

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
                const taskNode = createTaskUI(task, index, activeTab);
                fragment.prepend(taskNode);
            });
    }

    if (fragment.children.length === 0) {
        fragment.prepend(renderNoTasksMessage());
    }

    tasksContainer.prepend(fragment);
}

function renderNoTasksMessage() {
    const msgContainer = document.createElement("div");
    msgContainer.textContent = "You don't have any tasks, just relax!";

    return msgContainer;
}

function cleanTasksContainer() {
    tasksContainer.innerHTML = "";
}


// Form helper functions
function detectMissingInput(e) {
    if (e.currentTarget.value === "") {
        showInputError(e.currentTarget);
    } else {
        hideInputError(e.currentTarget);
    }
}

function getClosestErrorMessage(input) {
    const div = input.closest("div.task-modal_w");
    const errorNode = div.getElementsByClassName("invalid-input")[0];
    if (errorNode === null) return;

    return errorNode;
}

function showInputError(input) {
    const errorNode = getClosestErrorMessage(input);
    errorNode.classList.add("active");
}

function hideInputError(input) {
    const errorNode = getClosestErrorMessage(input);
    errorNode.classList.remove("active");
}

function validateFormData(input) {
    if (input.value === "") {
        showInputError(input);
        input.focus();
        return false;
    }
}

function resetForm() {
    const forms = taskModal.getElementsByClassName("task-modal_form active");
    for (let form of forms) {
        form.classList.remove("active");
        form.reset();

        const invalidInputs = form.getElementsByClassName("invalid-input active");
        if (invalidInputs === null) return;
        for (let i = invalidInputs.length - 1; i >= 0; i--) {
            invalidInputs[i].classList.remove("active");
        }
    }
}


// Test data
homeProject.addTask(task("Terminar modelado",
    "asdasdadsadsa",
    new Date("2022-07-24 00:00"),
    "high"));
homeProject.addTask(task("Terminar modelado - 1",
    `Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatum expedita at excepturi recusandae labore possimus unde dolorum molestias eligendi odit quibusdam doloremque repudiandae quia earum illum ullam maiores, asperiores pariatur. Sed, saepe ? Facere iure fugiat dolore magni, assumenda ullam dolorum, officiis accusantium dignissimos itaque beatae sed ratione saepe a, non molestias reprehenderit laborum error ? Aperiam neque magni in ea tempore. Eum laudantium maiores, id aperiam, dolore quam, facilis incidunt exercitationem labore dolorem sed non laborum repellendus ab distinctio maxime et vero enim ? Ex, rem hic voluptatum ad quisquam architecto nobis. Ex rerum porro error dolore, doloribus consequuntur, facilis quam quos iure ad tempora labore id explicabo laborum debitis ratione voluptate, nobis eos vero obcaecati quod distinctio eveniet provident.Nihil, doloremque ? 
    Aspernatur reiciendis aliquid rerum aliquam quas! Autem quod mollitia dicta placeat eveniet unde, consequuntur quis repellendus labore saepe cum laudantium dignissimos illo voluptate veritatis quo magnam ut sapiente porro nesciunt.`,
    new Date("2022-09-01 00:00"),
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