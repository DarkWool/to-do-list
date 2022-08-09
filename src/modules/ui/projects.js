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
sidebarItems[0].addEventListener("click", (e) => {
    changeProject(e.currentTarget, 0);
});
sidebarItems[1].addEventListener("click", (e) => {
    changeProject(e.currentTarget, "Today");
});
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
    const content = `<span class="icon-container"><svg style="width:20px;height:20px" viewBox="0 0 24 24"
     aria-hidden="true"><path d="m3.3 15.4c.717 0 1.3.583 1.3 1.3s-.583 1.3-1.3 1.3-1.3-.583-1.3-1.3.583-1.3 1.3-1.3zm2.7 1.85c0-.414.336-.75.75-.75h14.5c.414 0 .75.336.75.75s-.336.75-.75.75h-14.5c-.414 0-.75-.336-.75-.75zm-2.7-6.55c.717 0 1.3.583 1.3 1.3s-.583 1.3-1.3 1.3-1.3-.583-1.3-1.3.583-1.3 1.3-1.3zm2.7 1.3c0-.414.336-.75.75-.75h14.5c.414 0 .75.336.75.75s-.336.75-.75.75h-14.5c-.414 0-.75-.336-.75-.75zm-2.7-6c.717 0 1.3.583 1.3 1.3s-.583 1.3-1.3 1.3-1.3-.583-1.3-1.3.583-1.3 1.3-1.3zm2.7.75c0-.414.336-.75.75-.75h14.5c.414 0 .75.336.75.75s-.336.75-.75.75h-14.5c-.414 0-.75-.336-.75-.75z" fill-rule="nonzero" /></svg>
                            </span>`;
    item.textContent = title;
    item.classList.add("sidebar_item");
    item.insertAdjacentHTML("afterbegin", content);
    item.addEventListener("click", (e) => {
        changeProject(e.currentTarget, index);
    });

    return item;
}

function changeProject(projectNode, index) {
    switchProjectTab(projectNode);

    activeTab = index;

    if (index === "Today" || index === "This Week") {
        workspaceTitle.textContent = index;
        newTaskContainer.classList.remove("active");
    } else {
        workspaceTitle.textContent = projects[index].title;
        newTaskContainer.classList.add("active");
    }

    renderTasks();
}

function switchProjectTab(tab) {
    const activeElements = sidebar.getElementsByClassName("sidebar_item active");
    for (let item of activeElements) {
        item.classList.remove("active");
    }

    tab.classList.add("active");
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