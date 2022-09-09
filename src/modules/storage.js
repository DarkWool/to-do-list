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
                id: 5,
                title: "Thompson M1A1",
            }
        ]
        const testTasksData = [
            task("Terminar modelado",
                "asdasdadsadsa",
                new Date("2022-07-24 00:00"),
                "high",
                0,
            ),
            task("Terminar modelado - 1",
                `Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatum expedita at excepturi recusandae labore possimus unde dolorum molestias eligendi odit quibusdam doloremque repudiandae quia earum illum ullam maiores, asperiores pariatur. Sed, saepe ? Facere iure fugiat dolore magni, assumenda ullam dolorum, officiis accusantium dignissimos itaque beatae sed ratione saepe a, non molestias reprehenderit laborum error ? Aperiam neque magni in ea tempore. Eum laudantium maiores, id aperiam, dolore quam, facilis incidunt exercitationem labore dolorem sed non laborum repellendus ab distinctio maxime et vero enim ? Ex, rem hic voluptatum ad quisquam architecto nobis. Ex rerum porro error dolore, doloribus consequuntur, facilis quam quos iure ad tempora labore id explicabo laborum debitis ratione voluptate, nobis eos vero obcaecati quod distinctio eveniet provident.Nihil, doloremque ? 
            Aspernatur reiciendis aliquid rerum aliquam quas! Autem quod mollitia dicta placeat eveniet unde, consequuntur quis repellendus labore saepe cum laudantium dignissimos illo voluptate veritatis quo magnam ut sapiente porro nesciunt.`,
                new Date("2022-09-01 00:00"),
                "none",
                0
            ),
            task("Terminar modelado - 2",
                "asdasdadsadsa",
                new Date("2022-07-11 00:00"),
                "medium",
                0
            ),
            task("Terminar modelado - 3",
                null,
                new Date("2022-08-08 00:00"),
                "high",
                0
            ),
            task("Terminar modelado - today",
                "asdasdadsadsa",
                new Date("2022-09-06 00:00"),
                "none",
                0
            ),
            task(
                "You can edit this task and delete it!",
                "asdasdadsadsa",
                new Date("2022-07-24 00:00"),
                "none",
                5,
            ),
            task("21112",
                `Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatum expedita at excepturi recusandae labore possimus unde dolorum molestias eligendi odit quibusdam doloremque repudiandae quia earum illum ullam maiores, asperiores pariatur. Sed, saepe ? Facere iure fugiat dolore magni, assumenda ullam dolorum, officiis accusantium dignissimos itaque beatae sed ratione saepe a, non molestias reprehenderit laborum error ? Aperiam neque magni in ea tempore. Eum laudantium maiores, id aperiam, dolore quam, facilis incidunt exercitationem labore dolorem sed non laborum repellendus ab distinctio maxime et vero enim ? Ex, rem hic voluptatum ad quisquam architecto nobis. Ex rerum porro error dolore, doloribus consequuntur, facilis quam quos iure ad tempora labore id explicabo laborum debitis ratione voluptate, nobis eos vero obcaecati quod distinctio eveniet provident.Nihil, doloremque ? 
            Aspernatur reiciendis aliquid rerum aliquam quas! Autem quod mollitia dicta placeat eveniet unde, consequuntur quis repellendus labore saepe cum laudantium dignissimos illo voluptate veritatis quo magnam ut sapiente porro nesciunt.`,
                new Date("2022-09-04 00:00"),
                "high",
                5
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