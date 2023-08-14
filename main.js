// import { createStore } from 'redux';

// const todo = (state = {}, action) => {};

// const store = createStore(todo);

// const addTodo = () => ({
//   type: "ADD_TODO",
// })

let objOfTasks = JSON.parse(localStorage.getItem('tasks')) || [];
const listContainer = document.querySelector('.list');
const form = document.forms.addTask;
const input = form.elements.taskText;
const counter = document.querySelector('.list__counter');
const inputText = document.querySelector('.input__text');

const mediaQuery = window.matchMedia('(max-width: 640px)');

const handleMediaChange = (e) => {
  if (e.matches) {
    inputText.placeholder = '???';
  } else {
    inputText.placeholder = 'Что делать будем?';
  }
};

mediaQuery.addEventListener('change', handleMediaChange);
handleMediaChange(mediaQuery);

function handleInputFocus() {
  if (document.activeElement === input) {
    form.classList.add('input__highlight');
  } else {
    form.classList.remove('input__highlight');
  }
}

input.onfocus = handleInputFocus;
input.onblur = handleInputFocus;

const renderAllTasks = (tasks, fnTemplate) => {
  try {
    if (!tasks) {
      throw new Error('Нет задач!');
    }

    const fragment = document.createDocumentFragment();
    Object.values(tasks).forEach((task) => {
      const li = fnTemplate(task);
      fragment.append(li);
    });
    listContainer.append(fragment);
    return true;
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
    const { value } = inputFromDom;
    if (!value) {
      throw Error;
    }
    form.reset();
    return value;
  } catch (error) {
    Swal.fire('Нет дел - нет проблем!');
    throw error('Пустой input - код остановлен!');
    input.focus();
  }
};

const createNewTask = (fnTemplate) => (body) => {
  const newTask = {
    body,
    completed: false,
    _id: `task-${Math.random()}`,
  };
  const listItem = fnTemplate(newTask);
  listContainer.prepend(listItem);
  return newTask;
};

const addTaskToObj = (task) => {
  const newObjWithTask = [task, ...objOfTasks];
  objOfTasks = [...newObjWithTask];
  return newObjWithTask;
};

const changeLocalStorage = (obj) => {
  try {
    localStorage.setItem('tasks', JSON.stringify(obj));
    return obj;
  } catch (error) {
    throw error('Произошла ошибка в changeLocalStorage');
  }
};

const countListItems = (tasks) => {
  const lenghtObj = Object.keys(tasks).length;
  if (lenghtObj !== 0) {
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
  createNewTask(listItemTemplate),
  addTaskToObj,
  changeLocalStorage,
  countListItems
);

const onFormSubmitHandler = (e) => {
  e.preventDefault();
  return addingCycle(input);
};

form.addEventListener('submit', onFormSubmitHandler);

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
  try {
    const isConfirm = confirm('С глаз долой?');
    if (!isConfirm) throw Error;
    const newObjWithTask = objOfTasks.filter((obj) => obj._id !== id);
    // const newObjWithTask = {
    //   ...objOfTasks,
    // };
    // delete newObjWithTask[id];
    parent.remove();
    objOfTasks = [...newObjWithTask];

    return newObjWithTask;
  } catch (error) {
    throw error('Удаление не было подтверждено в delTask');
  }
};

const deleteHandler = compose(
  getIdElement,
  delTask,
  changeLocalStorage,
  countListItems
);

listContainer.addEventListener('click', deleteHandler);
