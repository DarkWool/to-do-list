import { tasksHandler, task } from "./tasks.js";
import { projectsHandler } from "./projects.js";
import { renderProjects } from "./ui/ui-projects.js";

function initStorage() {
    // Try to get data
    projectsHandler.items = JSON.parse(localStorage.getItem("projects"));
    tasksHandler.items = JSON.parse(localStorage.getItem("tasks"));

    // If there was no data in localStorage assign some test data
    if (projectsHandler.items === null || tasksHandler.items === null) {
        const testProjectsData = [
            {
                id: 0,
                title: "Home",
            },
            {
                id: 1,
                title: "Demo Project",
            }
        ]
        const testTasksData = [
            task("You can edit this task and delete it!",
                "",
                new Date("2022-09-17 00:00"),
                "none",
                0,
            ),
            task("Set priorities for each one of your tasks",
                `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eu tortor mi. Proin in sapien vehicula, 
                feugiat nunc sit amet, cursus velit. Integer ut nisi semper, fringilla elit ac, rutrum turpis. Vestibulum 
                lacinia efficitur arcu, vitae pharetra urna sagittis nec. Praesent sodales ornare tortor, at lacinia augue 
                condimentum et. Duis ut rutrum odio. Maecenas ac tincidunt magna, at finibus est. Donec eu massa id risus 
                gravida feugiat. Curabitur tincidunt turpis ut nunc facilisis sagittis.
                Etiam ultrices ultrices erat, vitae porttitor risus posuere quis. Pellentesque a metus posuere, fringilla
                eros ac, sagittis neque. Vivamus pretium semper arcu. Sed nisi velit, consectetur viverra feugiat vel,
                dapibus et lacus. Praesent eget tempus dolor. Duis lacinia tristique augue, eu pharetra sapien mattis id.
                Suspendisse faucibus lectus eros, eget dapibus purus lacinia sit amet. Pellentesque eleifend pulvinar imperdiet.`,
                new Date("2022-09-13 00:00"),
                "high",
                0
            ),
            task("Push the project to Github",
                "Don't forget that you have to do it before this week ends!",
                new Date("2022-09-13 00:00"),
                "medium",
                0
            ),
            task("Do some exercise",
                null,
                null,
                "low",
                0,
                true
            ),
            task("Take meds",
                "Example med",
                new Date("2022-09-12 00:00"),
                "none",
                0
            ),
            task(
                "You can create your own projects to organize the tasks",
                "Try it by clicking on the button to your bottom left corner '+ New Project'",
                new Date("2023-09-20 00:00"),
                "low",
                1,
            ),
            task("Demo task 2",
                `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eu tortor mi. Proin in sapien vehicula, 
                feugiat nunc sit amet, cursus velit. Integer ut nisi semper, fringilla elit ac, rutrum turpis. Vestibulum 
                lacinia efficitur arcu, vitae pharetra urna sagittis nec. Praesent sodales ornare tortor, at lacinia augue 
                condimentum et. Duis ut rutrum odio. Maecenas ac tincidunt magna, at finibus est. Donec eu massa id risus 
                gravida feugiat. Curabitur tincidunt turpis ut nunc facilisis sagittis.
                Etiam ultrices ultrices erat, vitae porttitor risus posuere quis. Pellentesque a metus posuere, fringilla
                eros ac, sagittis neque. Vivamus pretium semper arcu. Sed nisi velit, consectetur viverra feugiat vel,
                dapibus et lacus. Praesent eget tempus dolor. Duis lacinia tristique augue, eu pharetra sapien mattis id.`,
                new Date("2022-09-04 00:00"),
                "none",
                1
            ),
        ];

        localStorage.setItem("projects", JSON.stringify(testProjectsData));
        localStorage.setItem("tasks", JSON.stringify(testTasksData));

        projectsHandler.items = testProjectsData;
        tasksHandler.items = testTasksData;
    }

    projectsHandler.init();
    tasksHandler.init();
    renderProjects();
}

function updateProjectsStorage() {
    localStorage.setItem("projects", JSON.stringify(projectsHandler.items));
}

function updateTasksStorage() {
    localStorage.setItem("tasks", JSON.stringify(tasksHandler.items));
}


export { 
    initStorage,
    updateProjectsStorage,
    updateTasksStorage,
}