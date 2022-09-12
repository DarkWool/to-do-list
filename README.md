# To-do list - [view live](https://darkwool.github.io/to-do-list/)

Project made for The Odin Project curriculum, in this project users can create, update, and delete tasks or projects.

## Features

1. Create, edit and delete tasks.
1. Organize tasks by projects.
1. Each task can have its own "details" section to store important information about it.
1. Users can label tasks by priority (visually represented with colors).
1. Tasks can be sorted by date (ascendant or descendant).
1. Users can delete projects and edit their names.
1. There are 2 special "projects" to sort today and this week's tasks.
1. Each project has its own "completed tasks" section, so the user can concentrate on the uncompleted tasks without remembering the ones already completed.
1. Tasks and projects are managed with localStorage.

## Specifications

1. Your ‘todos’ are going to be objects that you’ll want to dynamically create, which means either using factories or constructors/classes to generate them.
1. Brainstorm what kind of properties your todo-items are going to have. At a minimum they should have a title, description, dueDate and priority. You might also want to include notes or even a checklist.
1. Your todo list should have projects or separate lists of todos. When a user first opens the app, there should be some sort of ‘default’ project to which all of their todos are put. Users should be able to create new projects and choose which project their todos go into.
1. You should separate your application logic (i.e. creating new todos, setting todos as complete, changing todo priority etc.) from the DOM-related stuff, so keep all of those things in separate modules.
1. The look of the User Interface is up to you, but it should be able to do the following:
    1. view all projects
    1. view all todos in each project (probably just the title and duedate… perhaps changing color for different priorities)
    1. expand a single todo to see/edit its details
    1. delete a todo
1. Since you are probably already using webpack, adding external libraries from npm is a cinch! You might want to consider using the following useful library in your code:
    1. date-fns gives you a bunch of handy functions for formatting and manipulating dates and times.
1. We haven’t learned any techniques for actually storing our data anywhere, so when the user refreshes the page, all of their todos will disappear! You should add some persistence to this todo app using the Web Storage API. 

Check the assignment's page [here.](https://www.theodinproject.com/lessons/node-path-javascript-todo-list)

## Credits

* No tasks message img by [unDraw.](https://undraw.co/)
