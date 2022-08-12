import { renderTasks } from "./tasks.js";
import { createNewProject, projects } from "../projects.js";

// Stores which project is currently selected by the user
let activeTab = 0;


// DOM Cache
const sidebar = document.getElementsByClassName("sidebar")[0];
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

    e.currentTarget.reset();
    hideNewProjectForm();
    composeNewProject(title);
});

// Functions
function composeNewProject(title) {
    const projectIndex = createNewProject(title);
    const projectUI = createProjectUI(title, projectIndex);
    sidebarUserProjects.prepend(projectUI);

    changeProject(projectUI, projectIndex);
}

function createProjectUI(title, index) {
    const item = document.createElement("li");
    const projectIcon = document.createElement("span");
    const projectTitle = document.createElement("div");
    const deleteProjectBtn = document.createElement("button");
    
    item.classList.add("sidebar_item");
    projectIcon.classList.add("icon-container");
    projectTitle.classList.add("flex-g");
    deleteProjectBtn.classList.add("icon-container", "sidebar_item-btn");
    
    projectTitle.textContent = title;
    projectIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24"
     aria-hidden="true"><path d="m3.3 15.4c.717 0 1.3.583 1.3 1.3s-.583 1.3-1.3 1.3-1.3-.583-1.3-1.3.583-1.3 1.3-1.3zm2.7 1.85c0-.414.336-.75.75-.75h14.5c.414 0 .75.336.75.75s-.336.75-.75.75h-14.5c-.414 0-.75-.336-.75-.75zm-2.7-6.55c.717 0 1.3.583 1.3 1.3s-.583 1.3-1.3 1.3-1.3-.583-1.3-1.3.583-1.3 1.3-1.3zm2.7 1.3c0-.414.336-.75.75-.75h14.5c.414 0 .75.336.75.75s-.336.75-.75.75h-14.5c-.414 0-.75-.336-.75-.75zm-2.7-6c.717 0 1.3.583 1.3 1.3s-.583 1.3-1.3 1.3-1.3-.583-1.3-1.3.583-1.3 1.3-1.3zm2.7.75c0-.414.336-.75.75-.75h14.5c.414 0 .75.336.75.75s-.336.75-.75.75h-14.5c-.414 0-.75-.336-.75-.75z" fill-rule="nonzero" /></svg>`;
    deleteProjectBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"></path></svg>`;
    
    item.append(projectIcon, projectTitle, deleteProjectBtn);
    item.addEventListener("click", (e) => {
        if (e.target.closest(".sidebar_item-btn")) {
            deleteProject(index);
            return;
        }

        changeProject(e.currentTarget, index);
    });

    return item;
}

function deleteProject(index) {
    projects.splice(index, 1);

    renderProjects();
}

function changeProject(projectNode, project) {
    switchProjectTab(projectNode);

    activeTab = project;

    if (project === "Today" || project === "This Week") {
        workspaceTitle.textContent = project;
        newTaskContainer.classList.remove("active");
    } else {
        workspaceTitle.textContent = projects[project].title;
        newTaskContainer.classList.add("active");
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

function renderProjects() {
    const fragment = document.createDocumentFragment();

    const totalProjects = projects.length;
    if (totalProjects !== 1) {
        // Create UI for every project in the array
        for (let i = 1; i < totalProjects; i++) {
            fragment.prepend(createProjectUI(projects[i].title, i));
        }

        // Activate the first element event listener (to change the curr project selected)
        fragment.children[0].click();
        // changeProject(fragment.children[0], totalProjects - 1);
    } else {
        // Activate the 'home' event listener and change the project selected
        sidebarItems[0].click();
        // changeProject(sidebarItems[0], 0);
    }

    sidebarUserProjects.innerHTML = "";
    sidebarUserProjects.prepend(fragment);
}


// New project form functions
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
    if (e.target.closest(".n-project_form") || e.target.closest("#newProject")) return;

    hideNewProjectForm();
}

function focusNode(node) {
    node.focus();
}

export {
    activeTab
};