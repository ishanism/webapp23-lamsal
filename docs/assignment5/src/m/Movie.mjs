import Person from "./Person.mjs";
import {cloneObject} from "../../lib/util.mjs";
import {NoConstraintViolation, MandatoryValueConstraintViolation,
  RangeConstraintViolation, UniquenessConstraintViolation}
  from "../../lib/errorTypes.mjs";

/** 
 * The class Movie
 * @class
 * @param {object} slots
 */
class Movie {
  // using a record parameter with ES6 function parameter destructuring
  constructor ({movieId, title, releaseDate, director, 
                  director_id, actors, actorIdRefs}) {
    this.movieId = movieId;
    this.title = title;
    this.releaseDate = releaseDate;
    // assign object references or ID references (to be converted in setter)
    this.actors = actors || actorIdRefs;
    if (director || director_id) {
      this.director = director || director_id;
    }
  }

  // movieId[1] : PositiveInteger {id}
  // <<get/set>> movieId[1] : number(int) {id}
  // checkMovieId (in movieId : number(int)) : ConstraintViolation
  // checkMovieIdasId (in movieId : number(int)) : ConstraintViolation

  get movieId() {
    return this._movieId;
  }

  static checkMovieId( movieId) {
    console.log("checkMovieId method!");
    if (!movieId) {
      return new NoConstraintViolation();
    }else {
      var id = parseInt(movieId);
    // } else if (typeof(id) !== "string" || id.trim() === "") {
    //   return new RangeConstraintViolation("The movie Id must not be empty!");
      if (!Number.isInteger(Number(id)) || Number(id) < 1) {
        return new RangeConstraintViolation(
          `The movie Id "${id}" ${typeof(id)} must be a positive integer!`);
      } else {
        return new NoConstraintViolation();
      }
    }
  }

  static checkMovieIdAsId( id) {
    console.log("checkMovieIdasId method!");
    var validationResult = Movie.checkMovieId( id);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!id) {
        validationResult = new MandatoryValueConstraintViolation(
            "A value for the movieId must be provided!");
      } else if (Movie.instances[id]) {  
        validationResult = new UniquenessConstraintViolation(
            "There is already a movie record with this movieId!");
      } else {
        validationResult = new NoConstraintViolation();
      } 
    }
    return validationResult;
  }

  set movieId( id) {
    console.log("set movieId method!");
    var validationResult = Movie.checkMovieIdAsId( id);
    if (validationResult instanceof NoConstraintViolation) {
      this._movieId = id;
    } else {
      throw validationResult;
    }
  }

  // title[1] : String
  // <<get/set>> title[1] : string
  // checkTitle (in title : string) : ConstraintViolation

  get title() {
    console.log("get title method!");
    return this._title;
  }

  static checkTitle( title) {
    console.log("checkTitle method!");
    if (typeof(title) !== "string" || title.trim() === "") {
      return new RangeConstraintViolation("The title must be a non-empty string!");
    } else if (title.length > 120) {
      return new RangeConstraintViolation("The title must be shorter than 120 characters!");
    } else {
      return new NoConstraintViolation();
    }
  }

  set title( title){
    console.log("set Title method!");
    var validationResult = Movie.checkTitle( title);
    if (validationResult instanceof NoConstraintViolation) {
      this._title = title;
    } else {
      throw validationResult;
    }
  }

  // releaseDate [1] : Date
  // <<get/set>> releaseDate [1] : Date
  // checkReleaseDate (in releaseDate : Date) : ConstraintViolation

  get releaseDate() {
    console.log("get releaseDate method!");
    return this._releaseDate;
  }

  static checkReleaseDate( releaseDate) {
    if (!releaseDate) {
      return new MandatoryValueConstraintViolation("A release date must be provided!");
    } else {
      return new NoConstraintViolation();
    }
  }
  
  set releaseDate( releaseDate) {
    console.log("set releaseDate method!");
    var validationResult = Movie.checkReleaseDate( releaseDate);
    if (validationResult instanceof NoConstraintViolation) {
      this._releaseDate = releaseDate;
    } else {
      throw validationResult;
    }
  }

  // director[1] : Person
  // <<get/set>> director[1] : Person
  // checkDirector (in director : Person) : ConstraintViolation

  get director() {
    console.log("get director method!");
    return this._director;
  }

  static checkDirector( director) {
    console.log("checkDirector method!");
    var validationResult = null;
    if (!director) {
      validationResult = new MandatoryValueConstraintViolation("A director must be specified!");
    } else {
      // invoke foreign key constraint check
      validationResult = Person.checkPersonIdAsIdRef( director);
    }
    return validationResult;
  }

  set director( director) {
    console.log("set director method!");
    const director_id = (typeof director !== "object") ? director : director.personId;

    const validationResult = Movie.checkDirector( director_id);

    if (validationResult instanceof NoConstraintViolation) {
      // create the new director reference
      if (this._director){
        // remove the old director reference
        delete this._director.directedMovies[this.movieId];
      }
      this._director = Person.instances[director_id];
      this._director.directedMovies[this._movieId] = this;
    } else {
      throw validationResult;
    }
  }

  // actors[*]: Person
  // <<get/set>> actors[*]: Person
  // checkActor (in actors : Person) : ConstraintViolation
  // addActor (in actor : Person)
  // removeActor (in actor : Person)

  get actors() {
    console.log("get actors method!");
    return this._actors;
  }

  static checkActor( actor_id) {
    console.log("checkActor method!");
    var validationResult = null;
    if (!actor_id) {
      // actor(s) are optional
      validationResult = new NoConstraintViolation();
    } else {
      validationResult = Person.checkPersonIdAsIdRef( actor_id);
    }
    return validationResult;
  }

  addActor( a) {
    console.log("addActor method!");
    var actor_id = (typeof a !== "object") ? parseInt(a) : a.personId;
    if (actor_id) {
      var validationResult = Movie.checkActor( actor_id);
      if (validationResult instanceof NoConstraintViolation) {
        // add the new actor reference
        // const key = String( actor_id);
        this._actors[actor_id] = Person.instances[actor_id];
        this._actors[actor_id].playedMovies[this._movieId] = this;

      } else {
        throw validationResult;
      }
    }
  }

  removeActor( a) {
    console.log("removeActor method!");
    var actor_id = (typeof a !== "object") ? parseInt(a) : a.actorId;
    if (actor_id) {
      var validationResult = Movie.checkActor( actor_id);
      if (validationResult instanceof NoConstraintViolation) {
        // delete the actor reference
        delete this._actors[actor_id].playedMovies[this._movieId];
        delete this._actors[actor_id];
      } else {
        throw validationResult;
      }
    }
  }

  set actors( a) {
    console.log("set actors method!");
    this._actors = {};
    if (Array.isArray(a)) {  // array of IdRefs
      for (const idRef of a) {
        this.addActor( idRef);
      }
    } else {  // map of IdRefs to object references
      for (const idRef of Object.keys( a)) {
        this.addActor( a[idRef]);
      }
    }
  }

  toString() {
    var movieStr = `Movie{ Movie ID: ${this.movieId}, title: ${this.title}, releaseDate: ${this.releaseDate}`;
    movieStr += `, director: ${this.director}`;
    movieStr += `, actors: ${Object.keys( this.actors).join(",")} }`;
    return `${movieStr}`;
  }

  toJSON() {  // is invoked by JSON.stringify in Movie.saveAll
    var rec = {};
    for (const p of Object.keys( this)) {
      if (p.charAt(0) !== "_") continue;
      switch (p) {
        case "_director":
          if (this._director) {
            rec.director_id = this._director;
          }
          break;
        case "_actors":
          // convert the map of object references to a list of ID references
          rec.actorIdRefs = [];
          for (const actorIdStr of Object.keys( this.actors)) {
            rec.actorIdRefs.push( parseInt( actorIdStr));
          }
          break;
        default:
          // remove underscore prefix
          rec[p.substr(1)] = this[p];
      }
    }
    return rec;
  }
}

Movie.instances = {};

Movie.add = function (slots) {
  try {
    const movie = new Movie( slots);
    Movie.instances[movie.movieId] = movie;
    console.log(`Movie record ${movie.toString()} created!`);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
  }
};

Movie.update = function ({movieId, title, releaseDate, 
  director, actorIdRefsToAdd, actorIdRefsToRemove }) {
  const movie = Movie.instances[movieId],
        objectBeforeUpdate = cloneObject( movie);
  var noConstraintViolated=true, updatedProperties=[];
  try {
    if (title && movie.title !== title) {
      movie.title = title;
      updatedProperties.push("title");
    }
    if (releaseDate && movie.releaseDate !== releaseDate) {
      movie.releaseDate = releaseDate;
      updatedProperties.push("releaseDate");
    }
    if (director && (movie.director_id !== director) ) {
      movie.director_id = director;
      updatedProperties.push("director_id");
    }
    if (actorIdRefsToAdd) {
      updatedProperties.push("actors(added)");
      for (const actorIdRef of actorIdRefsToAdd) {
        movie.addActor( actorIdRef);
      }
    }
    if (actorIdRefsToRemove) {
      updatedProperties.push("actors(removed)");
      for (const actor_id of actorIdRefsToRemove) {
        movie.removeActor( actor_id);
      }
    }
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its state before updating
    Movie.instances[movieId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      let ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for movie ${movieId}`);
    } else {
      console.log(`No property value changed for movie ${movie.movieId}!`);
    }
  }
};

Movie.destroy = function (movieId) {
  var movie = Movie.instances[movieId];
  if (movie) {
    console.log(`${movie.toString()} deleted!`);
    if (movie.director) {
      delete movie.director.playedMovies[movie.movieId];
    }
    for (const actorId of Object.keys( movie.actors)) {
      delete movie.actors[actorId].playedMovies[movie.movieId];
    }    
    delete Movie.instances[movieId];
  } else {
    console.log(`There is no movie with the ID ${movieId} in the database!`);
  }
};

Movie.retrieveAll = function () {
  var movies = {};
  try {
    if (!localStorage["movies"])
      localStorage["movies"] = "{}";
    else {
      movies = JSON.parse( localStorage["movies"]);
      console.log(`${Object.keys( movies).length} movie records loaded.`);
    }
  } catch (e) {
    alert( "Error when reading from Local Storage\n" + e);
  }
  for (const movieId of Object.keys( movies)) {
    try {
      Movie.instances[movieId] = new Movie( movies[movieId]);
    } catch (e) {
      console.log(`${e.constructor.name} while deserializing movie ${movieId}: ${e.message}`);
    }
  }
};

Movie.saveAll = function () {
  const nmrOfMovies = Object.keys( Movie.instances).length;
  try {
    localStorage["movies"] = JSON.stringify( Movie.instances);
    console.log(`${nmrOfMovies} movie records saved.`);
  } catch (e) {
    alert( "Error when writing to Local Storage\n" + e);
  }
};


export default Movie;