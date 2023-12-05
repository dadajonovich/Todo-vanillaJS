interface Todo {
  readonly _id: string;
  readonly body: string;
  completed: boolean;
}

(function () {
  const localStorageTasks = localStorage.getItem('tasks');
  let objOfTasks: Todo[] = localStorageTasks
    ? JSON.parse(localStorageTasks)
    : [];
  const listContainer = document.querySelector('.list') as HTMLUListElement;
  const form = document.forms.namedItem('addTask') as HTMLFormElement;
  const input = form.elements.namedItem('taskText') as HTMLInputElement;
  const counter = document.querySelector('.list__counter') as HTMLElement;
  const inputText = document.querySelector('.input__text') as HTMLInputElement;

  const mediaQuery = window.matchMedia('(max-width: 640px)');

  const handleMediaChange = (e: MediaQueryListEvent) => {
    if (e.matches) {
      inputText.placeholder = '???';
    } else {
      inputText.placeholder = 'Что делать будем?';
    }
  };

  mediaQuery.addEventListener('change', handleMediaChange);
  // handleMediaChange(mediaQuery);

  const handleInputFocus = () => {
    if (document.activeElement === input) {
      form.classList.add('input__highlight');
    } else {
      form.classList.remove('input__highlight');
    }
  };

  input.addEventListener('focus', handleInputFocus);
  input.addEventListener('blur', handleInputFocus);

  const handleDragStart = (event: DragEvent) => {
    if (event.target instanceof HTMLElement) {
      event.target.classList.add('list__item-dragging');
    }
  };

  const handleDragEnd = (event: DragEvent) => {
    if (event.target instanceof HTMLElement) {
      event.target.classList.remove('list__item-dragging');
    }
  };

  const initDrag = (e: DragEvent) => {
    e.preventDefault();
    const draggingItem = listContainer.querySelector('.list__item-dragging');
    const currentElement = e.target as HTMLElement;

    const isMoveable =
      draggingItem !== currentElement &&
      currentElement.classList.contains('list__item');

    if (!isMoveable) return;

    if (!draggingItem) return;

    const nextElement =
      currentElement === draggingItem.nextElementSibling
        ? currentElement.nextElementSibling
        : currentElement;

    listContainer.insertBefore(draggingItem, nextElement);
  };

  const initSortableList = () => {
    const updatedTasks: Todo[] = [];
    const listItems = listContainer.querySelectorAll('.list__item');
    listItems.forEach((item) => {
      const taskId = item.getAttribute('data-task-id');
      const task = objOfTasks.find((obj) => obj._id === taskId);
      if (task) {
        updatedTasks.push(task);
      }
    });
    objOfTasks = [...updatedTasks];
    changeLocalStorage(objOfTasks);
  };

  listContainer.addEventListener('dragover', initDrag);
  listContainer.addEventListener('dragend', initSortableList);

  const renderAllTasks = (
    tasks: readonly Todo[],
    fnTemplate: (todo: Todo) => HTMLLIElement,
  ) => {
    try {
      if (!tasks) {
        throw new Error('Нет задач!');
      }

      const fragment = document.createDocumentFragment();
      Object.values(tasks).forEach((task) => {
        const li = fnTemplate(task);
        li.addEventListener('dragstart', (e) => handleDragStart(e));
        li.addEventListener('dragend', (e) => handleDragEnd(e));
        fragment.append(li);
      });
      listContainer.append(fragment);
      return true;
    } catch (error) {
      console.log((error as Error).message);
      return error;
    }
  };

  const listItemTemplate = ({ _id, body }: Todo) => {
    const li = document.createElement('li');
    li.classList.add('list__item');
    li.setAttribute('data-task-id', _id);
    li.setAttribute('draggable', 'true');

    const wrapper = document.createElement('div');
    wrapper.classList.add('list__task');

    const article = document.createElement('p');
    article.classList.add('list__text');
    article.textContent = body;

    const deleteBtn = document.createElement('span');
    deleteBtn.classList.add('list__delete-btn');
    deleteBtn.insertAdjacentHTML('afterbegin', '&#10006;');

    wrapper.append(article, deleteBtn);

    li.append(wrapper);

    return li;
  };

  renderAllTasks(objOfTasks, listItemTemplate);

  const getInput = (inputFromDom: HTMLInputElement) => {
    try {
      const { value } = inputFromDom;
      if (!value) {
        throw new Error('Пустой input - код остановлен!');
      }
      form.reset();
      return value;
    } catch (error) {
      confirm('Нет дел - нет проблем!');
      console.log(error);
      throw error;
    }
  };

  const createNewTask =
    (fnTemplate: (todo: Todo) => HTMLLIElement) => (body: Todo['body']) => {
      const newTask = {
        body,
        completed: false,
        _id: `task-${Math.random()}`,
      };
      const listItem = fnTemplate(newTask);
      listItem.addEventListener('dragstart', (e) => handleDragStart(e));
      listItem.addEventListener('dragend', (e) => handleDragEnd(e));
      listContainer.prepend(listItem);
      return newTask;
    };

  const addTaskToObj = (task: Todo) => {
    const newObjWithTask = [task, ...objOfTasks];
    objOfTasks = [...newObjWithTask];
    return newObjWithTask;
  };

  const changeLocalStorage = (obj: Todo[]) => {
    try {
      localStorage.setItem('tasks', JSON.stringify(obj));
      return obj;
    } catch (error) {
      throw new Error('Произошла ошибка в changeLocalStorage');
    }
  };

  const countListItems = (tasks: Todo[]) => {
    const lenghtObj = Object.keys(tasks).length;
    if (lenghtObj !== 0) {
      counter.textContent = `${lenghtObj} items`;
    } else counter.textContent = 'Безделье это игрушка дьявола...';
  };

  document.addEventListener('DOMContentLoaded', (e) =>
    countListItems(objOfTasks),
  );

  const compose =
    (...fns: ((arg: any) => any)[]) =>
    (arg: any) =>
      fns.reduce((composed, f) => f(composed), arg);

  const addingCycle = compose(
    getInput,
    createNewTask(listItemTemplate),
    addTaskToObj,
    changeLocalStorage,
    countListItems,
  );

  const onFormSubmitHandler = (e: Event) => {
    e.preventDefault();
    return addingCycle(input);
  };

  form.addEventListener('submit', onFormSubmitHandler);

  const getIdElement = ({ target }: MouseEvent) => {
    if (!(target instanceof HTMLElement))
      throw new Error('Target не является HTMLElement');
    if (!target.classList.contains('list__delete-btn'))
      throw new Error('Событие не на кнопке удаления!');
    const parent = target.closest('[data-task-id]');

    if (!(parent instanceof HTMLElement))
      throw new Error('Parent не является HTMLElement');

    const id = parent.dataset.taskId!;
    return { id, parent };
  };

  const delTask = ({ id, parent }: { id: string; parent: HTMLElement }) => {
    const isConfirm = confirm('С глаз долой?');
    if (!isConfirm) throw new Error('Удаление не было подтверждено в delTask');
    const newObjWithTask = objOfTasks.filter((obj) => obj._id !== id);
    parent.remove();
    objOfTasks = [...newObjWithTask];

    return newObjWithTask;
  };

  const deleteHandler = compose(
    getIdElement,
    delTask,
    changeLocalStorage,
    countListItems,
  );

  listContainer.addEventListener('click', deleteHandler);
})();
