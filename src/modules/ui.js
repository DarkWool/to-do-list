import { format, compareAsc, parse, isToday, isThisWeek } from 'date-fns';
import { homeProject, createNewProject } from "./projects.js";
import { task, markTaskCompleted } from "./tasks.js";

let currentProject = "Home";
let editingTaskIndex;

const sidebar = document.getElementsByClassName("sidebar")[0];
const sidebarItems = sidebar.getElementsByClassName("sidebar_item");
const sidebarUserProjects = document.getElementsByClassName("sidebar_my-projects")[0];
const newProjectBtn = document.getElementById("newProject");
const newProjectForm = document.getElementsByClassName("n-project_form")[0];

const workspaceTitle = document.getElementsByClassName("workspace_title")[0];
const workspaceContent = document.getElementById("tasks");
const newTaskContainer = document.getElementsByClassName("n-task")[0];
const newTaskBtn = document.getElementsByClassName("n-task_btn")[0];

const taskModals = document.getElementsByClassName("task-modal");
const newTaskModal = taskModals[0];
const editTaskModal = taskModals[1];
const taskForm = document.getElementById("newTaskForm");
const editTaskForm = document.getElementById("editTaskForm");
const darkOverlay = document.getElementsByClassName("dark-overlay")[0];


const home = sidebarItems[0].addEventListener("click", switchSidebarTab);
const today = sidebarItems[1].addEventListener("click", switchSidebarTab);
const thisWeek = sidebarItems[2].addEventListener("click", switchSidebarTab);
newProjectBtn.addEventListener("click", showNewProjectForm);
newProjectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = e.currentTarget.elements[0].value;

    e.currentTarget.reset();
    hideNewProjectForm();

    composeNewProject(title);
});
newTaskBtn.addEventListener("click", () => openModal(newTaskModal));
taskForm.addEventListener("submit", getNewTaskData);
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

    currentProject = e.currentTarget.innerText;
    updateProjectWorkspace(e.currentTarget.innerText);
}

function updateProjectWorkspace(title) {
    if (workspaceTitle) {
        workspaceTitle.textContent = title;
    }

    if (currentProject === "Today" || currentProject === "This Week") {
        newTaskContainer.classList.remove("active");
    } else {
        newTaskContainer.classList.add("active");
    }

    renderTasks();
}

function showNewProjectForm() {
    newProjectBtn.classList.remove("active");
    newProjectForm.classList.add("active");

    document.addEventListener("click", detectClickOutsideForm); //not
    focusNode(newProjectForm.firstElementChild);
}

function hideNewProjectForm() {
    newProjectBtn.classList.add("active");
    newProjectForm.classList.remove("active");

    document.removeEventListener("click", detectClickOutsideForm); //not
}

function detectClickOutsideForm(e) {
    if (e.target.closest(".sidebar_bottom")) return;

    hideNewProjectForm();
}

function focusNode(node) {
    node.focus();
}

function composeNewProject(title) {
    const projectIndex = createNewProject(title);
    const projectUI = createProjectUI(title, projectIndex);
    sidebarUserProjects.prepend(projectUI);
}

function createProjectUI(title, index) {
    const item = document.createElement("li");
    const content = `<span class="icon-container">
                                <svg style="width:20px;height:20px" viewBox="0 0 24 24" aria-hidden="true">
                                    <path
                                        d="m3.3 15.4c.717 0 1.3.583 1.3 1.3s-.583 1.3-1.3 1.3-1.3-.583-1.3-1.3.583-1.3 1.3-1.3zm2.7 1.85c0-.414.336-.75.75-.75h14.5c.414 0 .75.336.75.75s-.336.75-.75.75h-14.5c-.414 0-.75-.336-.75-.75zm-2.7-6.55c.717 0 1.3.583 1.3 1.3s-.583 1.3-1.3 1.3-1.3-.583-1.3-1.3.583-1.3 1.3-1.3zm2.7 1.3c0-.414.336-.75.75-.75h14.5c.414 0 .75.336.75.75s-.336.75-.75.75h-14.5c-.414 0-.75-.336-.75-.75zm-2.7-6c.717 0 1.3.583 1.3 1.3s-.583 1.3-1.3 1.3-1.3-.583-1.3-1.3.583-1.3 1.3-1.3zm2.7.75c0-.414.336-.75.75-.75h14.5c.414 0 .75.336.75.75s-.336.75-.75.75h-14.5c-.414 0-.75-.336-.75-.75z"
                                        fill-rule="nonzero" />
                                </svg>
                            </span>`;
    item.textContent = title;
    item.classList.add("sidebar_item");
    item.insertAdjacentHTML("afterbegin", content);

    return item;
}

function cleanTasks() {
    workspaceContent.innerHTML = "";
}

function renderTasks() {
    // Clean tasks
    workspaceContent.innerHTML = "";

    const fragment = document.createDocumentFragment();
    switch (currentProject) {
        case "Home":
            homeProject.tasks.forEach((task, index) => {
                const taskNode = createTaskUI(task.title, task.details, task.date, task.priority, task.completed, index);
                fragment.prepend(taskNode);
            });
            break;
        case "Today":
            homeProject.tasks.forEach((task, index) => {
                if (isToday(task.date)) {
                    const taskNode = createTaskUI(task.title, task.details, task.date, task.priority, task.completed, index);
                    fragment.prepend(taskNode);
                }
            });
            break;
        case "This Week":
            homeProject.tasks.forEach((task, index) => {
                if (isThisWeek(task.date)) {
                    const taskNode = createTaskUI(task.title, task.details, task.date, task.priority, task.completed, index);
                    fragment.prepend(taskNode);
                }
            });
            break;
    }

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

    date = format(date, "E MMM dd, yyyy");

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
        taskDetailsBtn.classList.add("task_details-btn");
        taskDetails.textContent = details;

        taskDetailsBtn.type = "button";
        taskDetailsBtn.innerHTML = icons.details;

        taskTitle.append(taskDetailsBtn);
        container.append(checkbox, taskTitle, taskDetails, taskActions, taskDate);
        createNewTaskListeners(checkbox, taskActions, taskDetailsBtn);
    } else {
        container.append(checkbox, taskTitle, taskActions, taskDate);
        createNewTaskListeners(checkbox, taskActions);
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

function createNewTaskListeners(checkbox, taskActions, detailsBtn) {
    checkbox.addEventListener("input", markTaskCompletedUI);
    taskActions.addEventListener("click", (e) => {
        const button = e.target.closest("button");
        if (button === null) return; 

        if (button.dataset.taskAction === "edit") {
            openModal(editTaskModal);
            setEditFormValues(button);
        } else if (button.dataset.taskAction === "delete") {
            deleteTask(e.currentTarget);
        }
    });

    if (detailsBtn) detailsBtn.addEventListener("click", showTaskDetails);
}

function markTaskCompletedUI(e) {
    const taskNode = e.currentTarget.closest("div.task");
    const taskIndex = taskNode.dataset.taskIndex;
    taskNode.classList.toggle("completed");

    markTaskCompleted(taskIndex);
}

function showTaskDetails(e) {
    const taskNode = e.currentTarget.closest("div.task");
    const taskDetailsNode = taskNode.getElementsByClassName("task_details")[0];

    if (taskDetailsNode) {
        taskDetailsNode.classList.toggle("active");
        e.currentTarget.classList.toggle("rotate");
    }
}

function deleteTask(target) {
    // Delete task obj from project
    const taskNode = target.closest("div.task");
    const taskIndex = taskNode.dataset.taskIndex;
    homeProject.deleteTask(taskIndex);

    cleanTasks();
    renderTasks();
}

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

function composeNewTask(title, details, date, priority) {
    const newTask = task(title, details, date, priority);
    const newTaskIndex = homeProject.addTask(newTask);
    
    closeModal();
    
    workspaceContent.prepend(createTaskUI(title, details, date, priority, undefined, newTaskIndex));
}

function setEditFormValues(target) {
    // const formElements = editF
    const taskNode = target.closest("div.task");
    editingTaskIndex = taskNode.dataset.taskIndex;
    
    const currTask = homeProject.tasks[editingTaskIndex];
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

    const currTask = homeProject.tasks[editingTaskIndex];
    currTask.title = title;
    currTask.details = details;
    currTask.priority = priority;
    currTask.date = date;

    renderTasks();
    closeModal(editTaskModal);
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
    new Date("2022-07-20 00:00"),
    "high"));
homeProject.addTask(task("Terminar modelado - today",
    "asdasdadsadsa",
    new Date("2022-08-04 00:00"),
    "low"));

export {
    renderTasks,
    currentProject
};