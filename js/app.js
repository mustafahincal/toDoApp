//* Storage Controller 
const StorageController = (function() {

    return {
        setTaskToLS: function(task) {
            let tasks;
            if (localStorage.getItem("tasks") === null) {
                tasks = [];
                tasks.push(task);
            } else {
                tasks = JSON.parse(localStorage.getItem("tasks"));
                tasks.push(task);
            }
            localStorage.setItem("tasks", JSON.stringify(tasks));
        },
        getTaskFromLS: function() {
            let tasks;
            if (localStorage.getItem("tasks") === null) {
                tasks = [];
            } else {
                tasks = JSON.parse(localStorage.getItem("tasks"));
            }
            return tasks;
        },

        deleteTaskFromLS: function(task) {
            let tasks = JSON.parse(localStorage.getItem("tasks"));
            tasks.forEach((description, index) => {
                if (description === task) {
                    tasks.splice(index, 1);
                }
            });
            localStorage.setItem("tasks", JSON.stringify(tasks));
        },
        deleteManyTaskFromLS: function(tasks) {
            let tasksLS = JSON.parse(localStorage.getItem("tasks"));
            for (let i = 0; i < tasksLS.length; i++) {
                if (tasks.includes(tasksLS[i])) {
                    let index = tasksLS.indexOf(tasksLS[i]);
                    tasksLS.splice(index, 1);
                    i = i - 1;
                }
            }
            localStorage.setItem("tasks", JSON.stringify(tasksLS));
        }
    }

})();


//* Task Controller 
const TaskController = (function() {
    const data = {
        tasks: StorageController.getTaskFromLS(),
    }

    return {
        getTasks: function() {
            return data.tasks;
        },
        addTask: function(description) {
            data.tasks.push(description);
        },
        deleteTask: function(task) {
            data.tasks.forEach((description, index) => {
                if (description === task) {
                    data.tasks.splice(index, 1);
                }
            });
        },
        deleteManyTask: function(tasks) {
            for (let i = 0; i < data.tasks.length; i++) {
                if (tasks.includes(data.tasks[i])) {
                    let index = data.tasks.indexOf(data.tasks[i]);
                    data.tasks.splice(index, 1);
                    i = i - 1;
                }
            }
        }
    }
})();

//* UI Controller
const UIController = (function() {
    const selectors = {
        deleteButton: ".deleteBtn",
        addButton: ".addBtn",
        taskListItems: "#list li",
        taskName: "#task",
        list: "#list",
    }

    return {
        deleteTask: function(task) {
            task.remove();
        },
        deleteManyTask: function() {
            let tasks = document.querySelectorAll(selectors.taskListItems);
            tasks.forEach(task => {
                if (task.classList.contains("checked")) {
                    task.remove();
                }
            })
        },
        addTask: function(task) {
            let list = document.querySelector(selectors.list);
            let html = "";
            html = `<span class="text">${task}</span><span aria-hidden="true" class="deleteBtn">&times;</span>`;
            let li = document.createElement("li");
            li.className = "edit-task";
            li.innerHTML = html;
            list.appendChild(li);
        },
        createToDoList: function(tasks) {
            let list = document.querySelector(selectors.list);
            let html = "";
            tasks.forEach(task => {
                html = `<li class="edit-task"><span class="text">${task}</span><span aria-hidden="true" class="deleteBtn">&times;</span></li>`
                list.innerHTML += html;
            })

        },
        getSelectors: function() {
            return selectors;
        }

    }
})();

//* App Controller
const App = (function(TaskCtrl, UICtrl, StorageCtrl) {

    const UISelectors = UICtrl.getSelectors();

    const loadEventListeners = function() {
        document.querySelector(UISelectors.addButton).addEventListener("click", taskAdd);
        document.querySelector(UISelectors.list).addEventListener("click", taskEdit);
        document.querySelectorAll(UISelectors.deleteButton).forEach(btn => {
            btn.addEventListener("click", taskDelete);
        });
        document.querySelector(UISelectors.taskName).addEventListener("keypress", (e) => {
            if (e.key == "Enter") {
                taskAdd();
            }
        });
    }

    const taskAdd = function(e) {
        let taskDescription = document.querySelector(UISelectors.taskName).value;
        taskDescription = taskDescription.trim();
        if (taskDescription !== "") {
            //* add product (create object)
            TaskCtrl.addTask(taskDescription);

            //* add product to list
            UICtrl.addTask(taskDescription);

            //* set task to LS
            StorageCtrl.setTaskToLS(taskDescription)

            //* toast
            $(".liveToast.successs").toast("show");

            document.querySelector(UISelectors.taskName).value = "";
            loadEventListeners();
        } else {
            $('.liveToast.error').toast('show');
            document.querySelector(UISelectors.taskName).value = "";
        }

        e.preventDefault();
    }

    const taskEdit = function(e) {
        if (e.target.classList.contains("edit-task")) {
            e.target.classList.toggle("checked");
        }
        e.preventDefault();
    }

    const taskDelete = function(e) {
        let selectedTasks = [];
        const listItems = document.querySelectorAll("#list li.checked .text");
        listItems.forEach(item => {
            selectedTasks.push(item.textContent);
        });
        //* delete task
        TaskCtrl.deleteTask(e.target.previousSibling.textContent);
        TaskCtrl.deleteManyTask(selectedTasks);

        //* delete ui
        UICtrl.deleteTask(e.target.parentElement);
        UICtrl.deleteManyTask();

        //* delete from LS
        StorageCtrl.deleteTaskFromLS(e.target.previousSibling.textContent);
        StorageCtrl.deleteManyTaskFromLS(selectedTasks);


        e.preventDefault();
    }

    return {
        init: function() {
            console.log("starting app...");

            const tasks = StorageCtrl.getTaskFromLS();
            UICtrl.createToDoList(tasks);

            loadEventListeners();
        }
    }
})(TaskController, UIController, StorageController);

App.init();