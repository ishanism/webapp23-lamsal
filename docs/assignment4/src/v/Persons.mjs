import Person from "../m/Person.mjs";
import Movie from "../m/Movie.mjs";
import { fillSelectWithOptions } from "../../lib/util.mjs";

Person.retrieveAll();
Movie.retrieveAll();


for (const btn of document.querySelectorAll("button.back-to-persons-crud-menu")) {
  btn.addEventListener("click", refreshCrudUI);
}

for (const frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
  });
}

window.addEventListener("beforeunload", function() {
  Person.saveAll();
  Movie.saveAll();
});

// CRUD-R

document.getElementById("P_CRUD_R").addEventListener("click", function () {
  const tableBodyEl = document.querySelector("section#Person-CRUD-R>table>tbody");
  tableBodyEl.innerHTML = "";  // drop old content
  for (const key of Object.keys( Person.instances)) {
    const person = Person.instances[key];
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = person.personId;
    row.insertCell().textContent = person.name;
  }
  document.getElementById("Person-Menu").style.display = "none";
  document.getElementById("Person-CRUD-R").style.display = "block";
});

// CRUD-C

const createFormEl = document.querySelector("section#Person-CRUD-C > form");
document.getElementById("P_CRUD_C").addEventListener("click", function () {
  document.getElementById("Person-Menu").style.display = "none";
  document.getElementById("Person-CRUD-C").style.display = "block";
  createFormEl.reset();
});

createFormEl.personId.addEventListener("input", function () {
  createFormEl.personId.setCustomValidity(
    Person.checkPersonIdAsId( createFormEl.personId.value).message);
});

createFormEl.name.addEventListener("input", function () {
  createFormEl.name.setCustomValidity(
    Person.checkName( createFormEl.name.value).message);
});

createFormEl["commit"].addEventListener("click", function () {
  const slots = {
    personId: createFormEl.personId.value,
    name: createFormEl.name.value
  };

  createFormEl.personId.setCustomValidity(
    Person.checkPersonIdAsId( slots.personId).message);
  createFormEl.name.setCustomValidity(
    Person.checkName( slots.name).message);

  if (createFormEl.checkValidity()) {
    Person.add(slots);
    createFormEl.reset();
  } 
});

// CRUD-U

const updateFormEl = document.querySelector("section#Person-CRUD-U > form"),
      updateSelectPersonEl = updateFormEl["selectPerson"];
    
document.getElementById("P_CRUD_U").addEventListener("click", function () {
  updateSelectPersonEl.innerHTML = "";
  fillSelectWithOptions(updateSelectPersonEl, Person.instances,
     "personId", {displayProp: "name"});
  document.getElementById("Person-Menu").style.display = "none";
  document.getElementById("Person-CRUD-U").style.display = "block";
  updateFormEl.reset();
});

updateSelectPersonEl.addEventListener("change", handlePersonSelectionChange);

updateFormEl["commit"].addEventListener("click", function () {
  const personIdRef = updateSelectPersonEl.value;
  if (!personIdRef) {
    return;
  }
  const slots = {
    personId: updateFormEl.personId.value,
    name: updateFormEl.name.value
  };

  updateFormEl.name.setCustomValidity(
    Person.checkName( slots.name).message);

  if (updateFormEl.checkValidity()) {
    Person.update(slots);
    updateSelectPersonEl.options[updateSelectPersonEl.selectedIndex].text = slots.name;
  }
});

function handlePersonSelectionChange () {
  const key = updateSelectPersonEl.value;
  if (key) {
    const person = Person.instances[key];
    updateFormEl.personId.value = person.personId;
    updateFormEl.name.value = person.name;
  } else {
    updateFormEl.reset();
  }
}

// CRUD-D

const deleteFormEl = document.querySelector("section#Person-CRUD-D > form"),
      deleteSelectPersonEl = deleteFormEl["selectPerson"];

document.getElementById("P_CRUD_D").addEventListener("click", function () {
  document.getElementById("Person-Menu").style.display = "none";
  document.getElementById("Person-CRUD-D").style.display = "block";
  deleteSelectPersonEl.innerHTML = "";
  fillSelectWithOptions(deleteSelectPersonEl, Person.instances,
      "personId", {displayProp: "name"});
  deleteFormEl.reset();
});

deleteFormEl["commit"].addEventListener("click", function () {
  const personIdRef = deleteSelectPersonEl.value;
  if (!personIdRef) {
    return;
  }
  if (confirm(`Do you really want to delete person ${personIdRef}?`)) {
    Person.destroy(personIdRef);
    deleteSelectPersonEl.remove(deleteSelectPersonEl.selectedIndex);
  }
});


function refreshCrudUI() {
  document.getElementById("Person-Menu").style.display = "block";
  document.getElementById("Person-CRUD-C").style.display = "none";
  document.getElementById("Person-CRUD-R").style.display = "none";
  document.getElementById("Person-CRUD-U").style.display = "none";
  document.getElementById("Person-CRUD-D").style.display = "none";
}

refreshCrudUI();