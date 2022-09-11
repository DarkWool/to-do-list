import { renderTasks, resetSortTasksBtn } from "./ui-tasks.js";
import { createNewProject, projectsHandler } from "../projects.js";
import { tasksHandler } from "../tasks.js";
import { updateProjectsStorage, updateTasksStorage } from "../storage.js";
import { sidebar } from "./ui-menu.js";

let activeTab = 0;  // Stores which project is currently selected by the user
let sidebarProjectTitle;    // Stores the node of the selected project


// DOM Cache
const sidebarItems = sidebar.getElementsByClassName("sidebar_item");
const sidebarUserProjects = document.getElementsByClassName("sidebar_my-projects")[0];
const newProjectBtn = document.getElementById("newProject");
const newProjectForm = document.getElementsByClassName("n-project_form")[0];

const workspaceTitle = document.getElementsByClassName("workspace_title")[0];
const newTaskContainer = document.getElementsByClassName("n-task")[0];

// Event listeners
newProjectBtn.addEventListener("click", showNewProjectForm);
sidebarItems[0].addEventListener("click", (e) => changeProject(e.currentTarget, 0));
sidebarItems[1].addEventListener("click", (e) => changeProject(e.currentTarget, "Today"));
sidebarItems[2].addEventListener("click", (e) => changeProject(e.currentTarget, "This Week"));
newProjectForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = e.currentTarget.elements["formProjectTitle"].value;
    if (title === "") return;

    e.currentTarget.reset();
    hideNewProjectForm();
    composeNewProject(title);
});


// Functions
function composeNewProject(title) {
    const projectIndex = createNewProject(title);
    const projectUI = createProjectUI(projectsHandler.items[projectIndex], projectIndex);
    sidebarUserProjects.prepend(projectUI);

    updateProjectsStorage();
    changeProject(projectUI, projectIndex);
}

function createProjectUI(project, projectIndex) {
    const item = document.createElement("li");
    const projectIcon = document.createElement("span");
    const projectTitle = document.createElement("div");
    const deleteProjectBtn = document.createElement("button");
    
    item.classList.add("sidebar_item");
    projectIcon.classList.add("icon-container");
    projectTitle.classList.add("sidebar_item-title", "flex-g");
    deleteProjectBtn.classList.add("icon-container", "sidebar_item-btn");

    deleteProjectBtn.title = "Delete project";
    deleteProjectBtn.setAttribute("aria-label", "Delete project");
    
    projectTitle.textContent = project.title;
    projectIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m3.3 15.4c.717 0 1.3.583 1.3 1.3s-.583 1.3-1.3 1.3-1.3-.583-1.3-1.3.583-1.3 1.3-1.3zm2.7
        1.85c0-.414.336-.75.75-.75h14.5c.414 0 .75.336.75.75s-.336.75-.75.75h-14.5c-.414 0-.75-.336-.75-.75zm-2.7-6.55c.717
        0 1.3.583 1.3 1.3s-.583 1.3-1.3 1.3-1.3-.583-1.3-1.3.583-1.3 1.3-1.3zm2.7 1.3c0-.414.336-.75.75-.75h14.5c.414
        0 .75.336.75.75s-.336.75-.75.75h-14.5c-.414 0-.75-.336-.75-.75zm-2.7-6c.717 0 1.3.583 1.3 1.3s-.583 1.3-1.3
        1.3-1.3-.583-1.3-1.3.583-1.3 1.3-1.3zm2.7.75c0-.414.336-.75.75-.75h14.5c.414 0 .75.336.75.75s-.336.75-.75.75h-14.5c-.414
        0-.75-.336-.75-.75z" fill-rule="nonzero" /></svg>`;
    deleteProjectBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z">
        </path></svg>`;
    
    item.append(projectIcon, projectTitle, deleteProjectBtn);
    item.addEventListener("click", (e) => {
        if (e.target.closest(".sidebar_item-btn")) {
            deleteProject(projectIndex);
            return;
        }

        changeProject(e.currentTarget, projectIndex);
    });

    return item;
}

function deleteProject(index) {
    const projectId = projectsHandler.items[index].id;
    tasksHandler.removeProjectTasks(projectId);
    projectsHandler.removeProject(index);

    updateProjectsStorage();
    updateTasksStorage();
    renderProjects();
}

function changeProject(projectNode, projectIndex) {
    switchProjectTab(projectNode);
    resetSortTasksBtn();

    activeTab = projectIndex;
    sidebarProjectTitle = projectNode.getElementsByClassName("flex-g")[0];
    workspaceTitle.removeEventListener("click", updateProjectTitle);
    
    if (projectIndex === "Today" || projectIndex === "This Week") {
        workspaceTitle.textContent = projectIndex;
        newTaskContainer.classList.remove("active");
    } else {
        const project = projectsHandler.items[projectIndex];
        workspaceTitle.textContent = project.title;
        newTaskContainer.classList.add("active");
        
        if (project.id !== 0) {
            workspaceTitle.addEventListener("click", updateProjectTitle);
        }
    }

    renderTasks();
}

function switchProjectTab(tab) {
    const activeElements = Array.from(sidebar.getElementsByClassName("sidebar_item active"));
    for (let item of activeElements) {
        item.classList.remove("active");
    }

    tab.classList.add("active");
}

function updateProjectTitle() {
    const currProject = projectsHandler.items[activeTab];

    const input = document.createElement("input");
    input.value = currProject.title;
    input.type = "text";
    input.autocomplete = "off";
    input.classList.add("workspace_title-input");

    // Listeners
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") input.blur();
    });
    input.addEventListener("blur", () => {
        // Perform a basic 'validation', if the user lefts the project without a name set it to "Untitled"
        if (input.value === "") {
            workspaceTitle.innerText = "Untitled";
            sidebarProjectTitle.innerText = "Untitled";
            currProject.title = "Untitled";
        } else {
            workspaceTitle.innerText = input.value;
        }
        
        input.remove();
        updateProjectsStorage();
        workspaceTitle.classList.add("active");
    });
    input.addEventListener("input", () => {
        // Update the corresponding project title of the sidebar and the project object
        sidebarProjectTitle.innerText = input.value;
        currProject.title = input.value;
    });

    workspaceTitle.classList.remove("active");
    workspaceTitle.after(input);
    input.focus();
}

function renderProjects() {
    const fragment = document.createDocumentFragment();

    const totalProjects = projectsHandler.items.length;
    if (totalProjects !== 1) {
        // Create UI for every project in the array
        for (let i = 1; i < totalProjects; i++) {
            fragment.prepend(createProjectUI(projectsHandler.items[i], i));
        }
    }
    
    sidebarItems[0].click();
    sidebarUserProjects.innerHTML = "";
    sidebarUserProjects.prepend(fragment);
}


// New project form functions
function showNewProjectForm() {
    newProjectBtn.classList.remove("active");
    newProjectForm.classList.add("active");

    document.addEventListener("click", detectClickOutsideForm);
    newProjectForm.firstElementChild.focus();
}

function hideNewProjectForm() {
    newProjectBtn.classList.add("active");
    newProjectForm.classList.remove("active");

    document.removeEventListener("click", detectClickOutsideForm);
}

function detectClickOutsideForm(e) {
    if (e.target.closest(".n-project_form") || e.target.closest("#newProject")) return;

    hideNewProjectForm();
}


export {
    activeTab,
    renderProjects
};