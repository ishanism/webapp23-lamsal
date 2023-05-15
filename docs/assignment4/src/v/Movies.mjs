import Person from "../m/Person.mjs";
import Movie from "../m/Movie.mjs";
import { fillSelectWithOptions, createListFromMap, createMultiSelectionWidget } from "../../lib/util.mjs";

console.log("Check v/Movies.mjs");
Person.retrieveAll();
Movie.retrieveAll();



for (const btn of document.querySelectorAll("button.back-to-movies-crud-menu")) {
  btn.addEventListener("click", refreshCrudUI);
}

for (const frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
  });
}

window.addEventListener("beforeunload", Movie.saveAll);


// CRUD-R

document.getElementById("M_CRUD_R").addEventListener("click", function () {
  document.getElementById("Movie-Menu").style.display = "none";
  document.getElementById("Movie-CRUD-R").style.display = "block";
  const tableBodyEl = document.querySelector("section#Movie-CRUD-R>table>tbody");
  tableBodyEl.innerHTML = "";  // drop old content
  for (const key of Object.keys( Movie.instances)) {
    const movie = Movie.instances[key];
    // create list of actors for this movie
    const actorListEl = createListFromMap( movie.actors, "name");
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = movie.movieId;
    row.insertCell().textContent = movie.title;
    row.insertCell().textContent = movie.releaseDate;
    row.insertCell().textContent = movie.director.name;
    row.insertCell().appendChild( actorListEl);
  }
});

// CRUD-C


const createFormEl = document.querySelector("section#Movie-CRUD-C > form"),
      selectDirectorEl = createFormEl["selectDirector"],
      selectActorsEl = createFormEl["selectActors"];
document.getElementById("M_CRUD_C").addEventListener("click", function () {
  document.getElementById("Movie-Menu").style.display = "none";
  document.getElementById("Movie-CRUD-C").style.display = "block";
  fillSelectWithOptions(selectDirectorEl, Person.instances, "personId", {displayProp: "name"});
  fillSelectWithOptions(selectActorsEl, Person.instances, "personId", {displayProp: "name"});
  createFormEl.reset();
});

createFormEl["commit"].addEventListener("click", function () {
  createFormEl["movieId"].setCustomValidity(
      Movie.checkMovieIdAsId( createFormEl["movieId"].value).message);
});

createFormEl.title.addEventListener("input", function () {
  createFormEl.title.setCustomValidity(
      Movie.checkTitle( createFormEl["title"].value).message);
});
createFormEl.releaseDate.addEventListener("input", function () {
  createFormEl.releaseDate.setCustomValidity(
      Movie.checkReleaseDate( createFormEl["releaseDate"].value).message);
});

createFormEl["commit"].addEventListener("click", function () {
  const slots = {
    movieId: createFormEl["movieId"].value,
    title: createFormEl["title"].value,
    releaseDate: createFormEl["releaseDate"].value,
    director: createFormEl["selectDirector"].value,
    actorIdRefs: []
  };
  createFormEl.movieId.setCustomValidity(
      Movie.checkMovieIdAsId( slots.movieId).message);
  createFormEl.title.setCustomValidity(
      Movie.checkTitle( slots.title).message);
  createFormEl.releaseDate.setCustomValidity(
      Movie.checkReleaseDate( slots.releaseDate).message);
  createFormEl.selectDirector.setCustomValidity(
      Movie.checkDirector( slots.director).message);
  const selectActorOptions = createFormEl["selectActors"].selectedOptions;
  if (createFormEl.checkValidity()) {
    for (const optionEl of selectActorOptions) {
      slots.actorIdRefs.push( optionEl.value);
    }
    Movie.add( slots);
  }
});


// CRUD-U
const updateFormEl = document.querySelector("section#Movie-CRUD-U > form"),
      updateSelectMovieEl = updateFormEl["selectMovie"];
      
    
document.getElementById("M_CRUD_U").addEventListener("click", function () {
  updateSelectMovieEl.innerHTML = "";
  
  fillSelectWithOptions(updateSelectMovieEl, Movie.instances, "movieId", {displayProp: "title"});
  document.getElementById("Movie-Menu").style.display = "none";
  document.getElementById("Movie-CRUD-U").style.display = "block";
  updateFormEl.reset();

});

updateSelectMovieEl.addEventListener("change", function () {
  const saveButtonEl = updateFormEl["commit"],
        movieId = updateSelectMovieEl.value,
        updateSelectDirectorEl = updateFormEl["selectDirector"],
        updateSelectActorsWidgetEl = updateFormEl.querySelector("div.MultiSelectionWidget");
  if (movieId) {
    const movie = Movie.instances[movieId];
    updateFormEl.movieId.value = movie.movieId;
    updateFormEl.title.value = movie.title;
    updateFormEl.releaseDate.value = movie.releaseDate;
    fillSelectWithOptions(updateSelectDirectorEl, Person.instances,
      "personId", {displayProp: "name", selection: movie.director.personId});
    createMultiSelectionWidget(updateSelectActorsWidgetEl, movie.actors, Person.instances,
        "personId", "name", 1);

    if (movie.director) updateSelectDirectorEl.value = movie.director.name;
    saveButtonEl.disabled = false;
  } else {
    updateFormEl.reset();
    saveButtonEl.disabled = true;
    updateFormEl.selectDirector.selectedIndex = 0;
    updateSelectActorsWidgetEl.innerHTML = "";
  }
});

updateFormEl["commit"].addEventListener("click", function () {
  const movieIdRef = updateSelectMovieEl.value,
    updateSelectActorsWidgetEl = updateFormEl.querySelector("div.MultiSelectionWidget"),
    updateSelectedActorsListEl = updateSelectActorsWidgetEl.firstElementChild;
  if (!movieIdRef) return;
  const slots = {
    movieId: updateFormEl["movieId"].value,
    title: updateFormEl["title"].value,
    releaseDate: updateFormEl["releaseDate"].value,
    director: updateFormEl["selectDirector"].value,
  }
  updateFormEl.movieId.setCustomValidity(
    Movie.checkMovieIdAsId( slots.movieId).message);
  updateFormEl.title.setCustomValidity(
    Movie.checkTitle( slots.title).message);
  updateFormEl.releaseDate.setCustomValidity(
    Movie.checkReleaseDate( slots.releaseDate).message);
  
  if (updateFormEl.checkValidity()) {
    var actorIdRefsToAdd = [], actorIdRefsToDelete = [];
    for (const optionEl of updateSelectedActorsListEl.children) {
      if (optionEl.classList.contains("removed")) {
        actorIdRefsToDelete.push( optionEl.getAttribute("data-value"));
      }
      if (optionEl.classList.contains("added")) {
        actorIdRefsToAdd.push( optionEl.getAttribute("data-value"));
      }
    }

    if (actorIdRefsToAdd.length > 0) {
      slots.actorIdRefsToAdd = actorIdRefsToAdd;
    }
    if (actorIdRefsToDelete.length > 0) {
      slots.actorIdRefsToDelete = actorIdRefsToDelete;
    }

    Movie.update( slots);
    updateSelectMovieEl.options[updateSelectMovieEl.selectedIndex].text = slots.title;

    updateSelectActorsWidgetEl.innerHTML = "";
  }
});




// CRUD-D
const deleteFormEl = document.querySelector("section#Movie-CRUD-D > form");
const deleteSelectMovieEl = deleteFormEl["selectMovie"];
document.getElementById("M_CRUD_D").addEventListener("click", function () {
  deleteSelectMovieEl.innerHTML = "";
  fillSelectWithOptions(deleteSelectMovieEl, Movie.instances, "movieId", {displayProp: "title"});
  document.getElementById("Movie-Menu").style.display = "none";
  document.getElementById("Movie-CRUD-D").style.display = "block";
  deleteFormEl.reset();
});

deleteFormEl["commit"].addEventListener("click", function () {
  const movieId = deleteFormEl["selectMovie"].value;
  if (!movieId) {
    return;
  }
  if (confirm(`Do you really want to delete movie ${movieId}?`)) {
    Movie.destroy(movieId);
    deleteSelectMovieEl.remove(deleteSelectMovieEl.selectedIndex);
  }
});

function refreshCrudUI() {
  document.getElementById("Movie-Menu").style.display = "block";
  document.getElementById("Movie-CRUD-C").style.display = "none";
  document.getElementById("Movie-CRUD-R").style.display = "none";
  document.getElementById("Movie-CRUD-U").style.display = "none";
  document.getElementById("Movie-CRUD-D").style.display = "none";
}

refreshCrudUI();
