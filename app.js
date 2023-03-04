'use strict';

(() => {
  let objOfTasks = JSON.parse(localStorage.getItem('tasks')) || {};
  const listContainer = document.querySelector('.list');
  const form = document.forms['addTask'];
  const input = form.elements['taskText'];
  const counter = document.querySelector('.list__counter');
  const inputText = document.querySelector('.input__text');

  window.addEventListener('resize', (e) => {
    if (document.documentElement.clientWidth < 600) {
      inputText.placeholder = '???';
    } else inputText.placeholder = 'Что делать будем?';
  });

  const renderAllTasks = (tasks, fnListItemTemplate) => {
    try {
      if (!tasks) {
        throw new Error('Нет задач!');
      }

      const fragment = document.createDocumentFragment();
      Object.values(tasks).forEach((task) => {
        const li = fnListItemTemplate(task);
        fragment.append(li);
        return true;
      });

      listContainer.append(fragment);
    } catch (error) {
      console.log(error.message);
      return error;
    }
  };

  const listItemTemplate = ({ _id, body } = {}) => {
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
  };

  renderAllTasks(objOfTasks, listItemTemplate);

  const getInput = (inputFromDom) => {
    try {
      const value = inputFromDom.value;
      if (!value) {
        throw Error;
      }
      form.reset();
      return value;
    } catch (error) {
      Swal.fire('Нет дел - нет проблем!');
      throw error('Пустой input - код остановлен!');
    }
  };

  const createNewTask = (fnListItemTemplate) => (body) => {
    const newTask = {
      body,
      completed: false,
      _id: `task-${Math.random()}`,
    };
    const listItem = fnListItemTemplate(newTask);
    listContainer.prepend(listItem);
    return newTask;
  };

  const curryCreateNewTask = createNewTask(listItemTemplate);

  const addTaskToObj = (task) => {
    const newObjWithTask = {
      ...objOfTasks,
      [task._id]: task,
    };
    objOfTasks = { ...newObjWithTask };
    return newObjWithTask;
  };

  function changeLocalStorage(obj) {
    try {
      const tasksOnJson = JSON.stringify(obj);
      localStorage.setItem('tasks', tasksOnJson);
      return obj;
    } catch (error) {
      throw error('Произошла ошибка в changeLocalStorage');
    }
  }

  const countListItems = (tasks) => {
    const lenghtObj = Object.keys(tasks).length;
    if (lenghtObj != 0) {
      counter.textContent = `${lenghtObj} items`;
    } else counter.textContent = 'Безделье это игрушка дьявола...';
  };

  document.addEventListener('DOMContentLoaded', (e) =>
    countListItems(objOfTasks)
  );

  const compose =
    (...fns) =>
    (arg) =>
      fns.reduce((composed, f) => f(composed), arg);

  const addingCycle = compose(
    getInput,
    curryCreateNewTask,
    addTaskToObj,
    changeLocalStorage,
    countListItems
  );

  const onFormSubmitHandler = (e) => {
    e.preventDefault();
    return addingCycle(input);
  };

  form.addEventListener('submit', (e) => onFormSubmitHandler(e));

  // Delete

  const getIdElement = ({ target }) => {
    try {
      if (!target.classList.contains('list__delete-btn')) throw Error;
      const parent = target.closest('[data-task-id]');
      const id = parent.dataset.taskId;
      return { id, parent };
    } catch (error) {
      throw error('Событие не на кнопке удаления!');
    }
  };

  const delTask = ({ id, parent }) => {
    const isConfirm = confirm('С глаз долой?');
    if (!isConfirm) return isConfirm;
    const newObjWithTask = {
      ...objOfTasks,
    };
    delete newObjWithTask[id];
    parent.remove();
    objOfTasks = { ...newObjWithTask };

    return newObjWithTask;
  };

  const deleteCycl = compose(
    getIdElement,
    delTask,
    changeLocalStorage,
    countListItems
  );

  const onDeleteHandler = (e) => {
    return deleteCycl(e);
  };
  listContainer.addEventListener('click', (e) => {
    onDeleteHandler(e);
  });
})();
