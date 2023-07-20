import Movie from "./Movie.mjs";
import { cloneObject, isIntegerOrIntegerString } from "../../lib/util.mjs";
import { Enumeration } from "../../lib/Enumeration.mjs";
import { NoConstraintViolation, MandatoryValueConstraintViolation,
  RangeConstraintViolation, UniquenessConstraintViolation,
  ReferentialIntegrityConstraintViolation, 
  ConstraintViolation}
  from "../../lib/errorTypes.mjs";

const PersonCategoryEL = new Enumeration( ["Director", "Actor"]);

/**
 * The class Person.
 * @class
 * @param {object} slots - Object creation slots.
 */

//   Person
// <<get/set>> personId[1] : PositiveInteger {id}
// <<get/set>> name[1] : String
// <<get>>personCategory[*] : PersonCategoryEL
// <<get/set>>agent[0..1] : Person
// --
// {static} checkPersonId(in id : number(int)) : ConstraintViolation
// {static} checkPersonIdAsId(in id : number(int)) : ConstraintViolation
// {static} checkPersonIdAsIdRef(in id : number(int)) : ConstraintViolation
// {static} checkName(in name : string) : ConstraintViolation
// {static} checkAgentId(in per : Person) : ConstraintViolation  

class Person {
  constructor ({personId, name, personCategory, agent}) {
    this.personId = personId;
    this.name = name;
    if (personCategory) {
      this.personCategory = personCategory;
    }
    if (agent) {
      this.agent = agent;
    }
  }

  get personId() {
    return this._personId;
  }
  
  static checkPersonId( id) {
    console.log("checkPersonId method!");
    if (!id) {
      return new NoConstraintViolation();
    } else {
      id = parseInt(id);
      if (!Number.isInteger(Number(id)) || Number(id) < 1) {
        return new RangeConstraintViolation(`The person Id "${id}" ${typeof(id)} must be a positive integer!`);
      } else {
        return new NoConstraintViolation();
      }
    }
  }

  static checkPersonIdAsId( id) {
    console.log("checkPersonIdasId method!");
    var validationResult = Person.checkPersonId( id);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!id) {
        validationResult = new MandatoryValueConstraintViolation(
            "A value for the personId must be provided!");
      } else if (Person.instances[id]) {
        validationResult = new UniquenessConstraintViolation(
            "There is already a person record with this personId!");
      } else {
        validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  }

  static checkPersonIdAsIdRef( id) {
    var validationResult = Person.checkPersonId( id);
    if ((validationResult instanceof NoConstraintViolation) && id) {
      if (!Person.instances[id]) {
        validationResult = new ReferentialIntegrityConstraintViolation(
            "There is no person record with this personId!");
      }
    }
    return validationResult;
  }

  set personId( id) {
    var validationResult = Person.checkPersonIdAsId( id);
    if (validationResult instanceof NoConstraintViolation) {
      this._personId = id;
    } else {
      throw validationResult;
    }
  }

  get name() {
    return this._name;
  }

  static checkName( n) {
    if (!n) {
      return new MandatoryValueConstraintViolation(
          "A name must be provided!");
    } else if (!(typeof(n) === "string" && n.trim() !== "")) {
      return new RangeConstraintViolation(
          "The name must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }

  set name( n) {
    var validationResult = Person.checkName( n);
    if (validationResult instanceof NoConstraintViolation) {
      this._name = n;
    } else {
      throw validationResult;
    }
  }

  // get directedMovies() {
  //   return this._directedMovies;
  // }

  // get playedMovies() {
  //   return this._playedMovies;
  // }

  // <<get/set>>personCategory[*] : PersonCategoryEL
  get personCategory() {
    return this._personCategory;
  }

  static checkPersonCategory( pc) {
    if (!pc) {
      return new NoConstraintViolation();
    } else {
      for (const c of pc) {
        if (!isIntegerOrIntegerString(c) || parseInt( c) < 1 || parseInt(c) > PersonCategoryEL.MAX) {
          return new RangeConstraintViolation(
              "The personCategory value is not valid!");
        }
      }
    }
    return new NoConstraintViolation();
  }

  set personCategory( pc) {
    var validationResult = null;
    if (this.personCategory) {
      validationResult = new FrozenValueConstraintViolation(
          "The personCategory cannot be changed!");
    } else {
      validationResult = Person.checkPersonCategory( pc);
    }
    if (validationResult instanceof NoConstraintViolation) {
      var cat = [];
      for (const c of pc) {
        cat.push( parseInt(c));
      }
      this._personCategory = cat;
    } else {
      throw validationResult;
    }
  }


  // <<get/set>>agent[0..1] : Person
  // {static} checkAgent(in per : Person) : ConstraintViolation

  get agent() {
    return this._agent;
  }

  static checkAgent( a, cat) {
    var categories = [];
    for (const c of cat) {
      categories.push( parseInt(c));
    }

    if (!cat.includes( PersonCategoryEL.ACTOR) && a) {
      return new ConstraintViolation(
          "Actor cannot be an agent!");
    } else {
      return Person.checkPersonId( a);
    }
  }

  set agent ( a) {
    var validationResult = Person.checkAgent( a, this.personCategory);
    if (validationResult instanceof NoConstraintViolation) {
      this._agent = a;
    } else {
      throw validationResult;
    }
  } 

  toString() {
    return `Person{personId:${this.personId}, name:${this.name}}`;
  }

  toJSON() {
    var rec = {};
    for (const p of Object.keys( this)) {
      // remove underscore prefix
      if (p.charAt(0) === "_" && p !== "_directedMovies" && 
        p !== "_playedMovies") {
          rec[p.substr(1)] = this[p];
      }
    }
    return rec;
  } 
}

Person.instances = {};

Person.add = function (slots) {
  try {
    var person = new Person( slots);
    Person.instances[person.personId] = person;
    console.log(`Person ${person.personId} with name ${person.name} created!`);
  } catch (e) {
    console.log(e.constructor.name + ": " + e.message);
  }
};

Person.update = function (slots) {
  var person = Person.instances[slots.personId],
      noConstraintViolated = true,
      updatedProperties = [],
      objectBeforeUpdate = cloneObject( person);
  try {
    if (person.name !== slots.name) {
      person.name = slots.name;
      updatedProperties.push("name");
    }
    if (slots.personCategory){
      if (person.personCategory === undefined){
        person.personCategory = slots.personCategory;
        updatedProperties.push("personCategory");
      }
    }
    if (slots.agent && person.agent !== slots.agent) {
      person.agent = slots.agent;
      updatedProperties.push("agent");
    }
  } catch (e) {
    console.log(e.constructor.name + ": " + e.message);
    noConstraintViolated = false;
    // restore object to its state before updating
    Person.instances[slots.personId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      console.log(`Person ${slots.personId} modified: ${updatedProperties.join(", ")}`);
    } else {
      console.log(`No property value changed!`);
    }
  }
};

Person.destroy = function (personId) {
  var person = Person.instances[personId];
  for (const movieId of Object.keys( Movie.instances)) {
    let movie = Movie.instances[movieId];
    if (movie.director === person) {
      console.log(`Movie ${movieId} has ${personId} as director!`);
      Movie.destroy( movieId);
    }
  }

  for (const movieId of Object.keys( Movie.instances)) {
    let movie = Movie.instances[movieId];
    if (person in movie.actors) {
      delete movie.actors[personId];
    }
  }

  for (const personId of Object.keys( Person.instances)) {
    let per = Person.instances[personId];
    if (per.agent === person.personId) {
      delete per._agent;
    }
  }
  
  delete Person.instances[personId];
  console.log(`Person ${personId} deleted`);
  Person.saveAll();
  Movie.saveAll();
};

Person.retrieveAll = function () {
  var persons = {};
  if (!localStorage["persons"]) {
    localStorage["persons"] = "{}";
  }
  try {
    persons = JSON.parse( localStorage["persons"]);
  } catch (e) {
    console.log("Error when reading from Local Storage\n" + e);
    persons = {};
  }
  for (const personId of Object.keys( persons)) {
    try {
      Person.instances[personId] = new Person( persons[personId]);
    } catch (e) {
      console.log(e.constructor.name + " while deserializing a person: " + e.message);
    }
  }
  console.log( `${Object.keys( persons).length} persons loaded.`);
};

Person.saveAll = function () {
  const nmrOfPersons = Object.keys( Person.instances).length;
  try {
    localStorage["persons"] = JSON.stringify( Person.instances);
    console.log(`${nmrOfPersons} persons saved.`);
  } catch (e) {
    alert(`Error when writing Persons to Local Storage\n${e}`);
  }
};

export default Person;
export { PersonCategoryEL };
