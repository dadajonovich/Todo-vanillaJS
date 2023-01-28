"use strict";
//date ==========
let date = document.getElementById("date");
date.innerText = `${new Date().getFullYear()}`;
//date ===========

const tasks = [
  {
    _id: "5d2ca9e2e03d40b326596aa7",
    completed: true,
    body: "Occaecat non ea quis occaecat ad culpa amet deserunt incididunt elit fugiat pariatur. Exercitation commodo culpa in veniam proident laboris in. Excepteur cupidatat eiusmod dolor consectetur exercitation nulla aliqua veniam fugiat irure mollit. Eu dolor dolor excepteur pariatur aute do do ut pariatur consequat reprehenderit deserunt.\r\n",
    title: "Eu ea incididunt sunt consectetur fugiat non.",
  },
  {
    _id: "5d2ca9e29c8a94095c1288e0",
    completed: false,
    body: "Aliquip cupidatat ex adipisicing veniam do tempor. Lorem nulla adipisicing et esse cupidatat qui deserunt in fugiat duis est qui. Est adipisicing ipsum qui cupidatat exercitation. Cupidatat aliqua deserunt id deserunt excepteur nostrud culpa eu voluptate excepteur. Cillum officia proident anim aliquip. Dolore veniam qui reprehenderit voluptate non id anim.\r\n",
    title:
      "Deserunt laborum id consectetur pariatur veniam occaecat occaecat tempor voluptate pariatur nulla reprehenderit ipsum.",
  },
  {
    _id: "5d2ca9e2e03d40b3232496aa7",
    completed: true,
    body: "Occaecat non ea quis occaecat ad culpa amet deserunt incididunt elit fugiat pariatur. Exercitation commodo culpa in veniam proident laboris in. Excepteur cupidatat eiusmod dolor consectetur exercitation nulla aliqua veniam fugiat irure mollit. Eu dolor dolor excepteur pariatur aute do do ut pariatur consequat reprehenderit deserunt.\r\n",
    title: "Eu ea incididunt sunt consectetur fugiat non.",
  },
  {
    _id: "5d2ca9e29c8a94095564788e0",
    completed: false,
    body: "Aliquip cupidatat ex adipisicing veniam do tempor. Lorem nulla adipisicing et esse cupidatat qui deserunt in fugiat duis est qui. Est adipisicing ipsum qui cupidatat exercitation. Cupidatat aliqua deserunt id deserunt excepteur nostrud culpa eu voluptate excepteur. Cillum officia proident anim aliquip. Dolore veniam qui reprehenderit voluptate non id anim.\r\n",
    title:
      "Deserunt laborum id consectetur pariatur veniam occaecat occaecat tempor voluptate pariatur nulla reprehenderit ipsum.",
  },
];

(function (arrOfTasks) {
  // const objOfTasks = arrOfTasks.reduce((acc, task) => {
  //   acc[task._id] = task;
  //   return acc;
  // }, {});

  const objOfTasks = JSON.parse(localStorage.getItem("tasks")) || {};

  // Elements
  const listContainer = document.querySelector(".list");
  const form = document.forms["addTask"];
  const input = form.elements["taskText"];
  const counter = document.querySelector(".list__counter");
  const name = document.querySelector(".footer");

  renderAllTasks(objOfTasks);
  form.addEventListener("submit", onFormSubmitHandler);
  listContainer.addEventListener("click", onDeleteHandler);
  name.addEventListener("mouseover", renameHendler);
  name.addEventListener("mouseout", renameHendler);

  function renderAllTasks(tasksList) {
    if (!tasksList) {
      console.error("Задача не передана!");
      return;
    }

    const fragment = document.createDocumentFragment();
    Object.values(tasksList).forEach((task) => {
      const li = listItemTemplate(task);
      fragment.append(li);
    });

    listContainer.append(fragment);
  }

  function listItemTemplate({ _id, body } = {}) {
    const li = document.createElement("li");
    li.classList.add("list__item");
    li.setAttribute("data-task-id", _id);

    const wrapper = document.createElement("div");
    wrapper.classList.add("list__task");

    const article = document.createElement("p");
    article.classList.add("list__text");
    article.textContent = body;

    const deleteBtn = document.createElement("span");
    deleteBtn.classList.add("list__delete-btn");
    deleteBtn.insertAdjacentHTML("afterbegin", "&#10006;");

    wrapper.append(article, deleteBtn);

    const vl = document.createElement("div");
    vl.classList.add("list__vl");

    li.append(wrapper, vl);

    return li;
  }

  function onFormSubmitHandler(event) {
    event.preventDefault();
    const value = input.value;

    if (!value) {
      alert("Нет дел - нет проблем!");
      return;
    }
    const task = createNewTask(value);
    const listItem = listItemTemplate(task);
    listContainer.prepend(listItem);
    form.reset();

    countListItems();
  }

  function createNewTask(body) {
    const newTask = {
      body,
      completed: false,
      _id: `task-${Math.random()}`,
    };
    objOfTasks[newTask._id] = newTask;
    localStorage.setItem("tasks", JSON.stringify(objOfTasks));
    return { ...newTask };
  }

  function deleteTask(id) {
    const isConfirm = confirm("С глаз долой?");
    if (!isConfirm) return isConfirm;
    delete objOfTasks[id];
    localStorage.setItem("tasks", JSON.stringify(objOfTasks));
    return isConfirm;
  }

  function deleteTaskFromHtml(el, confirmed) {
    if (!confirmed) return;
    el.remove();
  }

  function onDeleteHandler({ target }) {
    const parent = target.closest("[data-task-id]");
    const id = parent.dataset.taskId;
    const confirmed = deleteTask(id);
    deleteTaskFromHtml(parent, confirmed);
    countListItems();
  }

  function countListItems() {
    const lenghtObj = Object.keys(objOfTasks).length;
    if (lenghtObj) {
      counter.textContent = `${lenghtObj} items`;
    } else counter.textContent = "Безделье это игрушка дьявола...";
  }

  function renameHendler(event) {
    const type = event.type;
    if (type === "mouseover") {
      name.textContent = "Привет, Карен!";
    } else name.textContent = "© Made By Timur Norbaev 2023";
  }
})(tasks);
