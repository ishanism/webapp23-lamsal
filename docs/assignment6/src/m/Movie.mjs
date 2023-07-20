import Person from "./Person.mjs";
import {cloneObject, isIntegerOrIntegerString} from "../../lib/util.mjs";
import { Enumeration } from "../../lib/Enumeration.mjs";
import {ConstraintViolation, FrozenValueConstraintViolation, MandatoryValueConstraintViolation,
  NoConstraintViolation, PatternConstraintViolation, RangeConstraintViolation,
  UniquenessConstraintViolation}
  from "../../lib/errorTypes.mjs";


/**
 * Enumeration type
 * @global
 */
const MovieCategoryEL = new Enumeration( ["Tv Series Episode", "Biography"]);

/** 
 * The class Movie
 * @class
 * @param {object} slots
 */
class Movie {
  // using a record parameter with ES6 function parameter destructuring
  constructor ({movieId, title, releaseDate, director, 
                  director_id, actors, actorIdRefs,
                  movieCategory, tvSeriesName, episodeNo, about}) {
    this.movieId = movieId;
    this.title = title;
    this.releaseDate = releaseDate;
    // assign object references or ID references (to be converted in setter)
    this.actors = actors || actorIdRefs;
    if (director || director_id) {
      this.director = director || director_id;
    }
    if (movieCategory) this.movieCategory = movieCategory;
    if (tvSeriesName) this.tvSeriesName = tvSeriesName;
    if (episodeNo) this.episodeNo = episodeNo;
    if (about) this.about = about;
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

  // <<get/set>> movieCategory[0..1] : number {from MovieCategoryEL, frozen}
  // {static} checkMovieCategory(in cat : number) : ConstraintViolation
  

  get movieCategory() {
    console.log("get movieCategory method!");
    return this._movieCategory;
  }

  static checkMovieCategory( cat) {
    console.log("checkMovieCategory method!");
    if (cat === undefined || cat === "") {
      return new NoConstraintViolation();  // movieCategory is optional
    } else if (!isIntegerOrIntegerString(cat) || parseInt(cat) < 1 ||
        parseInt(c) > MovieCategoryEL.MAX) {
      return new RangeConstraintViolation(
          "Invalid value for movieCategory: "+ c);
    } else {
      return new NoConstraintViolation();
    }
  }

  set movieCategory( cat) {
    var validationResult = null;
    if (this.movieCategory) {  // already set/assigned
      validationResult = new FrozenValueConstraintViolation(
          "The movieCategory cannot be changed!");
    } else {
      validationResult = Movie.checkCategory( cat);
    }
    if (validationResult instanceof NoConstraintViolation) {
      this._movieCategory = parseInt( cat);
    } else {
      throw validationResult;
    }
  }

  // <<get/set>> tvSeriesName[0..1] : string
  // {static} checkTvSeriesName(in tvName : string) : ConstraintViolation

  get tvSeriesName() {
    console.log("get tvSeriesName method!");
    return this._tvSeriesName;
  }

  static checkTvSeriesName( tvName, c) {
    console.log("checkTvSeriesName method!");
    const cat = parseInt( c);
    if (cat === MovieCategoryEL.TV_SERIES_EPISODE && !tvName) {
      return new MandatoryValueConstraintViolation(
          "A TV series name must be provided for a TV series episode!");
    } else if (cat !== MovieCategoryEL.TV_SERIES_EPISODE && tvName) {
      return new ConstraintViolation(
          "A TV series name must not be provided for other category of Movies!");
    } else if (tvName && (typeof(tvName) !== "string" || tvName.trim() === "")) {
      return new RangeConstraintViolation(
          "The TV series name must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }

  set tvSeriesName( tvName) {
    console.log("set tvSeriesName method!");
    var validationResult = Movie.checkTvSeriesName( tvName, this.movieCategory);
    if (validationResult instanceof NoConstraintViolation) {
      this._tvSeriesName = tvName;
    } else {
      throw validationResult;
    }
  }

  // <<get/set>> episodeNo[0..1] : number(int)
  // {static} checkEpisodeNo(in epiNo : number(int)) : ConstraintViolation
  
  get episodeNo() {
    console.log("get episodeNo method!");
    return this._episodeNo;
  }

  static checkEpisodeNo( epiNo, c) {
    console.log("checkEpisodeNo method!");
    const cat = parseInt( c);
    if (cat === MovieCategoryEL.TV_SERIES_EPISODE && !epiNo) {
      return new MandatoryValueConstraintViolation(
          "An episode number must be provided for a TV series episode!");
    } else if (cat !== MovieCategoryEL.TV_SERIES_EPISODE && epiNo) {
      return new ConstraintViolation(
          "An episode number must not be provided for other category of Movies!");
    } else if (epiNo && (!isIntegerOrIntegerString(epiNo) || parseInt(epiNo) < 1)) {
      return new RangeConstraintViolation(
          "The episode number must be a positive integer!");
    } else {
      return new NoConstraintViolation();
    }
  }

  set episodeNo( epiNo) {
    console.log("set episodeNo method!");
    var validationResult = Movie.checkEpisodeNo( epiNo, this.movieCategory);
    if (validationResult instanceof NoConstraintViolation) {
      this._episodeNo = parseInt( epiNo);
    } else {
      throw validationResult;
    }
  }


  // <<get/set>> about[0..1] : Person
  // {static} checkAbout(in per : Person) : ConstraintViolation

  get about() {
    console.log("get about method!");
    return this._about;
  }

  static checkAbout( per, c) {
    console.log("checkAbout method!");
    const cat = parseInt( c);
    if (cat === MovieCategoryEL.BIOGRAPHY && !per) {
      return new MandatoryValueConstraintViolation(
          "A person must be provided for a biography!");
    } else if (cat !== MovieCategoryEL.BIOGRAPHY && per) {
      return new ConstraintViolation(
          "A person must not be provided for other category of Movies!");
    } else if (per && !(per instanceof Person)) {
      return new RangeConstraintViolation(
          "The person must be an instance of Person!");
    } else if (per && cat === MovieCategoryEL.BIOGRAPHY) {
      validationResult = Person.checkPersonIdAsIdRef( per.personId);
      return validationResult;
    } else {
      return new ConstraintViolation(
          "The checkAbout function did not work for certain region. Debug!");
    }
  }

  set about( per) {
    console.log("set about method!");
    var validationResult = Movie.checkAbout( per, this.movieCategory);
    if (validationResult instanceof NoConstraintViolation) {
      this._about = per;
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
      
      this._director = Person.instances[director_id];
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
    switch (this.category) {
      case MovieCategoryEL.TV_SERIES_EPISODE:
        movieStr += `, TV series name: ${this.tvSeriesName}, episodeNo: ${this.episodeNo}`;
        break;
      case MovieCategoryEL.BIOGRAPHY:
        movieStr += `, about: ${this.about}`;
        break;
    }
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
  var movie = null;
  try {
    movie = new Movie( slots);
    // Movie.instances[movie.movieId] = movie;
    console.log(`Movie record ${movie.toString()} created!`);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
  }
};

Movie.update = function ({movieId, title, releaseDate, 
  director, actorIdRefsToAdd, actorIdRefsToRemove, 
  movieCategory, tvSeriesName, episodeNo, about}) {
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
    if (movieCategory) {
      if (movie.movieCategory === undefined) {
        movie.movieCategory = movieCategory;
        updatedProperties.push("movieCategory");
      } else if (movie.movieCategory !== movieCategory) {
        throw new ConstraintViolation(
          "The movieCategory cannot be changed!");
      }
    } else if (movieCategory === "" && "movieCategory" in movie) {
      throw new FrozenValueConstraintViolation(
        "The movieCategory cannot be deleted!");
    }
    if (tvSeriesName && movie.tvSeriesName !== tvSeriesName) {
      movie.tvSeriesName = tvSeriesName;
      updatedProperties.push("tvSeriesName");
    }
    if (episodeNo && movie.episodeNo !== episodeNo) {
      movie.episodeNo = episodeNo;
      updatedProperties.push("episodeNo");
    }
    if (about && movie.about !== about) {
      movie.about = about;
      updatedProperties.push("about");
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
      // delete movie.director.playedMovies[movie.movieId];
      // delete Person.instances[movie.director];
    }
    for (const actorId of Object.keys( movie.actors)) {
      // delete movie.actors[actorId].playedMovies[movie.movieId];
      // delete Person.instances[actorId];
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
export { MovieCategoryEL };