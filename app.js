'use strict';

(() => {
  // Elements
  const objOfTasks = JSON.parse(localStorage.getItem('tasks')) || {};
  const listContainer = document.querySelector('.list');
  const form = document.forms['addTask'];
  const input = form.elements['taskText'];
  const counter = document.querySelector('.list__counter');
  const name = document.querySelector('.footer');
  const inputText = document.querySelector('.input__text');

  form.addEventListener('submit', onFormSubmitHandler);
  listContainer.addEventListener('click', onDeleteHandler);
  name.addEventListener('mouseover', renameHandler);
  name.addEventListener('mouseout', renameHandler);
  window.addEventListener('resize', (e) => {
    if (document.documentElement.clientWidth < 600) {
      inputText.placeholder = '???';
    } else inputText.placeholder = 'Что делать будем?';
  });

  function renderAllTasks(tasks, fn) {
    try {
      if (!tasks) {
        throw new Error('Нет задач!');
      }

      const fragment = document.createDocumentFragment();
      Object.values(tasks).forEach((task) => {
        const li = fn(task);
        fragment.append(li);
      });

      listContainer.append(fragment);
    } catch (error) {
      console.log(error.message);
    }
  }

  function listItemTemplate({ _id, body } = {}) {
    const li = document.createElement('li');
    li.classList.add('list__item');
    li.setAttribute('data-task-id', _id);

    const wrapper = document.createElement('div');
    wrapper.classList.add('list__task');

    const article = document.createElement('p');
    article.classList.add('list__text');
    article.textContent = body;

    const deleteBtn = document.createElement('span');
    deleteBtn.classList.add('list__delete-btn');
    deleteBtn.insertAdjacentHTML('afterbegin', '&#10006;');

    wrapper.append(article, deleteBtn);

    const vl = document.createElement('div');
    vl.classList.add('list__vl');

    li.append(wrapper, vl);

    return li;
  }

  renderAllTasks(objOfTasks, listItemTemplate);

  function onFormSubmitHandler(event) {
    event.preventDefault();
    const value = input.value;

    if (!value) {
      // alert('Нет дел - нет проблем!');
      Swal.fire('Нет дел - нет проблем!');
      return;
    }
    const task = createNewTask(value);
    const listItem = listItemTemplate(task);
    listContainer.prepend(listItem);
    form.reset();
  }

  function createNewTask(body) {
    const newTask = {
      body,
      completed: false,
      _id: `task-${Math.random()}`,
    };
    objOfTasks[newTask._id] = newTask;
    changeLocalStorage(objOfTasks);
    return { ...newTask };
  }

  function deleteTask(id) {
    const isConfirm = confirm('С глаз долой?');
    if (!isConfirm) return isConfirm;
    delete objOfTasks[id];
    changeLocalStorage(objOfTasks);
    return isConfirm;
  }

  function deleteTaskFromHtml(el, confirmed) {
    if (!confirmed) return;
    el.remove();
  }

  function onDeleteHandler({ target }) {
    if (target.classList.contains('list__delete-btn')) {
      const parent = target.closest('[data-task-id]');
      const id = parent.dataset.taskId;
      const confirmed = deleteTask(id);
      deleteTaskFromHtml(parent, confirmed);
    } else return;
  }

  function renameHandler(event) {
    const type = event.type;
    if (type === 'mouseover') {
      name.textContent = 'Привет, Карен!';
    } else name.textContent = '© Made By Timur Norbaev 2023';
  }

  function changeLocalStorage(objOfTasks) {
    const tasksOnJson = JSON.stringify(objOfTasks);
    localStorage.setItem('tasks', tasksOnJson);
    countListItems(objOfTasks);
  }

  function countListItems(tasks) {
    const lenghtObj = Object.keys(tasks).length;
    if (lenghtObj != 0) {
      counter.textContent = `${lenghtObj} items`;
    } else counter.textContent = 'Безделье это игрушка дьявола...';
  }
})();
