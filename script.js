const addBtns = document.querySelectorAll('.add-btn:not(.solid)');
const saveItemBtns = document.querySelectorAll('.solid');
const addItemContainers = document.querySelectorAll('.add-container');
const addItems = document.querySelectorAll('.add-item');
// Item Lists
const listColumns = document.querySelectorAll('.drag-item-list');
const backlogList = document.getElementById('backlog-list');
const progressList = document.getElementById('progress-list');
const completeList = document.getElementById('complete-list');
const onHoldList = document.getElementById('on-hold-list');

// Items
let updatedOnLoad = false;

const ARRAY_NAMES = ['backlog', 'progress', 'complete', 'onHold'];
// Initialize Arrays
let backlogListArray = [];
let progressListArray = [];
let completeListArray = [];
let onHoldListArray = [];
let listArrays = [];

// Drag Functionality
let draggedItem;
let isDragging = false;
let currentListIndex;

// Get Arrays from localStorage if available, set default values if not
function getSavedColumns() {
  if (localStorage.getItem('backlogItems')) {
    backlogListArray = JSON.parse(localStorage.backlogItems);
    progressListArray = JSON.parse(localStorage.progressItems);
    completeListArray = JSON.parse(localStorage.completeItems);
    onHoldListArray = JSON.parse(localStorage.onHoldItems);
  } else {
    backlogListArray = ['Release the course', 'Sit back and relax'];
    progressListArray = ['Work on projects', 'Listen to music'];
    completeListArray = ['Being cool', 'Getting stuff done'];
    onHoldListArray = ['Being uncool'];
  }
}

// Set localStorage Arrays
function updateSavedColumns() {
  listArrays = [backlogListArray, progressListArray, completeListArray, onHoldListArray];
  listArrays.forEach((arrayName, index) => {
    localStorage.setItem(`${ARRAY_NAMES[index]}Items`, JSON.stringify(arrayName));
  })
}

/**
 * Create DOM Elements for each list item
 * @param {HTMLElement} listElement the list parent element
 * @param {number} listIndex column index
 * @param {string} item list item
 * @param {number} index index of the item in the list
 */
function createItemEl(listElement, listIndex, item, index) {
  // List Item
  const listItemEl = document.createElement('li');
  listItemEl.classList.add('drag-item');
  listItemEl.textContent = item;
  listItemEl.draggable = "true";
  listItemEl.setAttribute("ondragstart", 'drag(event)');
  listItemEl.contentEditable = true;
  listItemEl.id = index;
  listItemEl.setAttribute("onfocusout", `updateItem(${index}, ${listIndex})`);
  // Append
  listElement.appendChild(listItemEl);
}

// Update Columns in DOM - Reset HTML, Filter Array, Update localStorage
function updateDOM() {
  // Check localStorage once
  if (!updatedOnLoad) {
    getSavedColumns();
  }
  // Backlog Column
  createListElementsFromArray(backlogList, backlogListArray, 0);
  // Progress Column
  createListElementsFromArray(progressList, progressListArray, 1);
  // Complete Column
  createListElementsFromArray(completeList, completeListArray, 2);
  // On Hold Column
  createListElementsFromArray(onHoldList, onHoldListArray, 3);
  // Run getSavedColumns only once, Update Local Storage
  updatedOnLoad = true;
  updateSavedColumns();
}

/**
 * Update Item - Delete if necessary, or update array value
 * @param {number} itemIndex index of the item in the list
 * @param {number} listIndex index of the list (0/1/2/3)
 */
function updateItem(itemIndex, listIndex) {
  if (!isDragging) {
    const selectedArray = listArrays[listIndex];
    const selectedListElement = listColumns[listIndex].children;
    const itemText = selectedListElement[itemIndex].textContent;
    if (!itemText || itemText.length === 0) {
      selectedArray.splice(itemIndex, 1);
    } else {
      selectedArray[itemIndex] = itemText;
    }
    updateDOM();
  }
}

// Create a list element for each item of a given array
function createListElementsFromArray(listElement, listArray, listElementIndex) {
  listElement.textContent = '';
  listArray.forEach((listItem, index) => {
    createItemEl(listElement, listElementIndex, listItem, index);
  });
}

// Allows arrays to reflect Drag and Drop items
function recreateArrays() {
  backlogListArray = addNewElementsToArray(backlogList);
  progressListArray = addNewElementsToArray(progressList);
  completeListArray = addNewElementsToArray(completeList);
  onHoldListArray = addNewElementsToArray(onHoldList);
  updateDOM();
}

/**
 * Add item to list and reset textbox
 * @param {number} listIndex index of the list
 */
function addItemToList(listIndex) {
  const itemText = addItems[listIndex].textContent;
  listArrays[listIndex].push(itemText);
  addItems[listIndex].textContent = '';
  updateDOM();
}

/**
 * Show Add Item List Box
 * @param {number} listIndex index of the list
 */
function showInputBox(listIndex) {
  addBtns[listIndex].style.visibility = 'hidden';
  saveItemBtns[listIndex].style.display = 'flex';
  addItemContainers[listIndex].style.display = 'flex';
}

/**
 * Hide Add Item List Box
 * @param {number} listIndex index of the list
 */
function hideInputBox(listIndex) {
  addBtns[listIndex].style.visibility = 'visible';
  saveItemBtns[listIndex].style.display = 'none';
  addItemContainers[listIndex].style.display = 'none';
  addItemToList(listIndex);
}

/**
 * Add items to array after drag and drop occurs
 * @param {HTMLElement} element 
 */
function addNewElementsToArray(element) {
  return Array.from(element.children).map(el => el.textContent);
}

// When user starts dragging item
function drag(event) {
  draggedItem = event.target;
  isDragging = true;
}

// Function to allow drop on list
function allowDrop(event) {
  event.preventDefault();
}

// When user drops an item in the list
function drop(event) {
  event.preventDefault();
  // Remove background color/padding
  listColumns.forEach(listElement => listElement.classList.remove("over"));
  // Add item to list
  listColumns[currentListIndex].appendChild(draggedItem);
  // Dragging complete
  isDragging = false;
  recreateArrays();
}

// When an item enters a droppable list
function dragEnter(columnIndex) {
  listColumns[columnIndex].classList.add("over");
  currentListIndex = columnIndex;
}

// On Load
updateDOM();