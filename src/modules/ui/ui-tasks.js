import { format, isToday, isThisWeek, isValid, compareAsc, compareDesc, isPast } from "date-fns";
import { tasksHandler, task } from "../tasks.js";
import { projectsHandler } from "../projects.js";
import { activeTab } from "./ui-projects.js";
import { updateTasksStorage } from "../storage.js";
import { darkOverlay } from "./ui-menu.js";
import emptyMessageImage from "../../images/walking-outside.png";

let uncompletedTaskCount;
const currTaskInfo = {
    index: null,
};


// Dom cache
const newTaskBtn = document.getElementsByClassName("n-task_btn")[0];
const tasksContainer = document.getElementById("tasks");
const completedTasksContainer = document.getElementById("completedTasks");
const sortTasksBtn = document.getElementsByClassName("workspace_actions-btn")[0];

const taskModal = document.getElementsByClassName("task-modal")[0];
const taskModalTitle = taskModal.getElementsByClassName("task-modal_title")[0];
const modalCloseBtn = taskModal.getElementsByClassName("close-modal-btn")[0];
const newTaskForm = document.getElementById("newTaskForm");
const editTaskForm = document.getElementById("editTaskForm");
const newTaskTitle = document.getElementById("f-nTaskTitle");
const editTaskTitle = document.getElementById("f-eTaskTitle");
const selectInputs = taskModal.getElementsByClassName("task-modal_select");

// Event Listeners
newTaskBtn.addEventListener("click", () => openModal("new"));
newTaskForm.addEventListener("submit", getNewTaskData);
editTaskForm.addEventListener("submit", editTask);
darkOverlay.addEventListener("click", closeModal);
modalCloseBtn.addEventListener("click", closeModal);
newTaskTitle.addEventListener("blur", detectMissingInput);
editTaskTitle.addEventListener("blur", detectMissingInput);
sortTasksBtn.addEventListener("click", (e) => {
    const button = e.target;

    if (button.dataset.sort == null) {
        button.dataset.sort = "asc";
        button.innerHTML = `Sort <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3l-6 
        8h4v10h4v-10h4l-6-8zm16 14h-8v-2h8v2zm2 2h-10v2h10v-2zm-4-8h-6v2h6v-2zm-2-4h-4v2h4v-2zm-2-4h-2v2h2v-2z"/></svg>`;
    } else if (button.dataset.sort === "asc") {
        button.dataset.sort = "desc";
        button.innerHTML = `Sort <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 
        21l6-8h-4v-10h-4v10h-4l6 8zm16-12h-8v-2h8v2zm2-6h-10v2h10v-2zm-4 8h-6v2h6v-2zm-2 4h-4v2h4v-2zm-2 4h-2v2h2v-2z" />
        </svg>`;
    } else {
        // Return to not sorted task list
        resetSortTasksBtn();
    }

    renderTasks();
});

for (let select of selectInputs) {
    select.addEventListener("change", (e) => changeFormPriorityIndicator(e.target));
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
    const projectId = projectsHandler.items[activeTab].id;
    const newTask = task(title, details, date, priority, projectId);
    const newTaskIndex = tasksHandler.addTask(newTask);
    updateTasksStorage();

    // If this is the first task of the project then clean the 'no tasks' message
    if (uncompletedTaskCount === 0) cleanUncompletedTasksContainer();
    uncompletedTaskCount++;

    // If the user selected a sort order then re-render the tasks to put the new one in the correct place
    if (sortTasksBtn.dataset.sort === "asc" || sortTasksBtn.dataset.sort === "desc") {
        return renderTasks();
    }

    tasksContainer.prepend(createTaskUI(newTask, newTaskIndex));
}

function createTaskUI(task, taskIndex) {
    const taskContainer = document.createElement("div");
    const checkbox = document.createElement("input");
    const taskTitle = document.createElement("div");
    const taskActions = document.createElement("div");
    const editTaskBtn = document.createElement("button");
    const deleteTaskBtn = document.createElement("button");
    const taskDate = document.createElement("div");

    taskContainer.classList.add("task");
    taskTitle.classList.add("task_title");
    taskActions.classList.add("task_actions");
    taskDate.classList.add("task_date");
    editTaskBtn.classList.add("icon-container");
    deleteTaskBtn.classList.add("icon-container");

    checkbox.type = "checkbox";
    editTaskBtn.type = "button";
    deleteTaskBtn.type = "button";

    taskTitle.textContent = task.title;
    editTaskBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,
        5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"></path></svg>`;
    deleteTaskBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z">
        </path></svg>`;

    if (task.date !== null) {
        if (isToday(task.date) === false && isPast(task.date)) {
            taskDate.classList.add("overdue");
        }

        taskDate.textContent = format(task.date, "E MMM dd, yyyy");
    } else {
        taskDate.textContent = "No Date";
    }

    editTaskBtn.dataset.taskAction = "edit";
    deleteTaskBtn.dataset.taskAction = "delete";

    checkbox.setAttribute("aria-label", "Mark task as completed");
    editTaskBtn.setAttribute("aria-label", "Edit task");
    deleteTaskBtn.setAttribute("aria-label", "Delete task");
    
    taskActions.append(editTaskBtn, deleteTaskBtn);

    if (task.details) {
        const taskDetails = document.createElement("div");
        const taskDetailsBtn = document.createElement("button");

        taskDetails.classList.add("task_details");
        taskDetailsBtn.classList.add("task_details-btn");
        taskDetails.textContent = task.details;

        taskDetailsBtn.type = "button";
        taskDetailsBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"></path></svg>`;

        taskDetailsBtn.setAttribute("aria-label", "Show task details");

        taskTitle.append(taskDetailsBtn);
        taskContainer.append(checkbox, taskTitle, taskDetails, taskDate, taskActions);
        createNewTaskListeners(taskIndex, checkbox, taskActions, taskDetailsBtn);
    } else {
        taskContainer.append(checkbox, taskTitle, taskDate, taskActions);
        createNewTaskListeners(taskIndex, checkbox, taskActions);
    }

    if (task.priority) {
        switch (task.priority) {
            case "low":
                taskContainer.classList.add("low-priority");
                break;
            case "medium":
                taskContainer.classList.add("medium-priority");
                break;
            case "high":
                taskContainer.classList.add("high-priority");
        }
    }

    if (task.completed === true) {
        checkbox.checked = true;
        taskContainer.classList.toggle("completed");
    }

    return taskContainer;
}

function createNewTaskListeners(taskIndex, checkbox, taskActions, detailsBtn) {
    checkbox.addEventListener("input", (e) => {
        markTaskCompletedUI(e.target, taskIndex);
    });

    taskActions.addEventListener("click", (e) => {
        const button = e.target.closest("button");
        if (button === null) return;

        currTaskInfo.index = taskIndex;

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
function markTaskCompletedUI(target, taskIndex) {
    const taskNode = target.closest("div.task");
    taskNode.classList.toggle("completed");

    const completedState = tasksHandler.toggleCompletedState(taskIndex);
    updateTasksStorage();

    if (completedState === true) {
        uncompletedTaskCount--;
        completedTasksContainer.prepend(taskNode);
    } else {
        uncompletedTaskCount++;
        renderTasks();
    }
    
    renderNoTasksMessage();
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
    tasksHandler.removeTask(currTaskInfo.index);

    updateTasksStorage();
    renderTasks();
}


// Edit task
function setEditFormValues() {
    let currTask = tasksHandler.items[currTaskInfo.index];
    editTaskForm.reset();

    const formFields = editTaskForm.elements;
    formFields["f-eTaskTitle"].value = currTask.title;
    formFields["f-eTaskDetails"].value = currTask.details;
    formFields["f-eTaskPriority"].value = currTask.priority;

    changeFormPriorityIndicator(formFields["f-eTaskPriority"]);

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

    let currTask = tasksHandler.items[currTaskInfo.index];
    currTask.title = title;
    currTask.details = details;
    currTask.priority = priority;

    // If the date is valid change the value of the task object
    if (isValid(date) === true) {
        currTask.date = date;
    } else {
        currTask.date = null;
    }

    updateTasksStorage();
    renderTasks();
    closeModal();
}


// Helpers
function renderTasks() {
    cleanTasksContainers();

    const uncompletedFragment = document.createDocumentFragment();
    const completedFragment = document.createDocumentFragment();
    const sortMethod = sortTasksBtn.dataset.sort;
    let filteredTasks = filterTasks();

    if (sortMethod != undefined) {
        filteredTasks = sortTasks(filteredTasks, sortMethod);
    }

    filteredTasks.forEach((task) => {
        const taskNode = createTaskUI(task, task.arrIndex);

        if (task.completed === true) completedFragment.prepend(taskNode);
        else uncompletedFragment.prepend(taskNode);

        delete task.arrIndex;
    });

    completedTasksContainer.prepend(completedFragment);
    
    // If there are no uncompleted tasks, render a special message
    uncompletedTaskCount = uncompletedFragment.children.length;
    if (renderNoTasksMessage() === true) {
        return;
    } else {
        tasksContainer.prepend(uncompletedFragment);
    }
}

function filterTasks() {
    switch (activeTab) {
        case "Today":
            return tasksHandler.items.filter((task, index) => {
                task.arrIndex = index;
                return isToday(task.date);
            });
        case "This Week":
            return tasksHandler.items.filter((task, index) => {
                task.arrIndex = index;
                return isThisWeek(task.date);
            });
        default:
            const id = projectsHandler.items[activeTab].id;
            return tasksHandler.items.filter((task, index) => {
                task.arrIndex = index;
                return task.projectIndex === id;
            });
    }
}

function sortTasks(tasksArr, sortMethod) {
    const pastDate = new Date(-1, 0, 1, 0, 0, 1);
    if (sortMethod === "asc") {
        return tasksArr.sort((a, b) => {
            let dateA = (a.date) ? a.date : pastDate;
            let dateB = (b.date) ? b.date : pastDate;
            return compareAsc(dateA, dateB);
        });
    } else if (sortMethod === "desc") {
        return tasksArr.sort((a, b) => {
            let dateA = (a.date) ? a.date : pastDate;
            let dateB = (b.date) ? b.date : pastDate;
            return compareDesc(dateA, dateB);
        });
    }
}

function createNoTasksMessageUI() {
    const msgContainer = document.createElement("div");
    const message = document.createElement("p");
    const image = document.createElement("img");

    msgContainer.classList.add("tasks_empty");
    image.classList.add("tasks_empty-img");

    image.src = emptyMessageImage;
    image.alt = "A woman walking in the park";
    message.textContent = "You don't have any tasks, just relax!";

    msgContainer.prepend(image, message);

    return msgContainer;
}

function renderNoTasksMessage() {
    if (uncompletedTaskCount === 0) {
        const message = createNoTasksMessageUI();
        tasksContainer.prepend(message);
        return true;
    }

    return false;
}

function cleanUncompletedTasksContainer() {
    tasksContainer.innerHTML = "";
}

function cleanTasksContainers() {
    tasksContainer.innerHTML = "";
    completedTasksContainer.innerHTML = "";
}


// Sort tasks (btn)
function resetSortTasksBtn() {
    sortTasksBtn.removeAttribute("data-sort");
    sortTasksBtn.innerHTML = `Sort
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10v4h4l-6 7-6-7h4v-4h-4l6-7 6 7h-4zm16
        5h-10v2h10v-2zm0 6h-10v-2h10v2zm0-8h-10v-2h10v2zm0-4h-10v-2h10v2zm0-4h-10v-2h10v2z"/></svg>`;
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

function changeFormPriorityIndicator(select) {
    const label = select.previousElementSibling;
    resetFormPriorityIndicator(label);
    
    switch (select.value) {
        case "low":
            label.classList.add("low");
            break;
        case "medium":
            label.classList.add("medium");
            break;
        case "high":
            label.classList.add("high");
            break;
    }
}
            
function resetFormPriorityIndicator(label) {
    label.classList.remove("low", "medium", "high");
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

        const selectIndicator = form.getElementsByClassName("select-indicator")[0];
        if (selectIndicator != null) resetFormPriorityIndicator(selectIndicator);

        const invalidInputs = form.getElementsByClassName("invalid-input active");
        if (invalidInputs === null) return;
        for (let i = invalidInputs.length - 1; i >= 0; i--) {
            invalidInputs[i].classList.remove("active");
        }
    }
}


newTaskForm.reset();
editTaskForm.reset();


export {
    renderTasks,
    taskModal,
    closeModal,
    resetSortTasksBtn,
};