const sidebar = document.getElementsByClassName("sidebar")[0];
const sidebarItems = sidebar.getElementsByClassName("sidebar_item");
const newTaskContainer = document.getElementsByClassName("n-task")[0];

const workspaceTitle = document.getElementsByClassName("workspace_title")[0];
const workspaceContent = document.getElementById("tasks");

const home = sidebarItems[0].addEventListener("click", switchSidebarTab);
const today = sidebarItems[1].addEventListener("click", switchSidebarTab);
const thisWeek = sidebarItems[2].addEventListener("click", switchSidebarTab);

function switchSidebarTab(e) {
    // Get sidebar elements which have the 'active' class and remove it
    const activeElements = sidebar.getElementsByClassName("sidebar_item active");
    for (let item of activeElements) {
        item.classList.remove("active");
    }

    e.currentTarget.classList.add("active");

    switch (e.currentTarget.innerText) {
        case "Home":
            newTaskContainer.classList.add("active");
            break;
        case "Today":
            newTaskContainer.classList.remove("active");
            break;
        case "This Week":
            newTaskContainer.classList.remove("active");
            break;
    }
}