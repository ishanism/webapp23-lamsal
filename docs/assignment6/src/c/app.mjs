console.log("Importing Person,Movie in app.mjs file");
import Person from "../m/Person.mjs";
import Movie from "../m/Movie.mjs";
console.log("Import Successfull Person,Movie in app.mjs file");

function createSampleData() {
  try {
    Person.instances["1"] = new Person({
      personId: "1",
      name: "Stephen Frears"
    });
    Person.instances["2"] = new Person({
      personId: "2",
      name: "George Lucas"
    });
    Person.instances["3"] = new Person({
      personId: "3",
      name: "Quentin Tarantino"
    });
    Person.instances["5"] = new Person({
      personId: "5",
      name: "Uma Thurman"
    });
    Person.instances["6"] = new Person({
      personId: "6",
      name: "John Travolta"
    });
    Person.instances["7"] = new Person({
      personId: "7",
      name: "Ewan McGregor"
    });
    Person.instances["8"] = new Person({
      personId: "8",
      name: "Natalie Portman"
    });
    Person.instances["9"] = new Person({
      personId: "9",
      name: "Keanu Reeves"
    });                        
    Person.saveAll();
    Movie.instances["1"] = new Movie({
      movieId: "1",
      title: "Pulp Fiction",
      releaseDate: "1994-05-12",
      director: Person.instances[3],
      actors: ["5", "6"]
    });
    Movie.instances["2"] = new Movie({
      movieId: "2",
      title: "Star Wars",
      releaseDate: "1977-05-25",
      director: Person.instances[2],
      actors: ["7", "8"]
    });
    Movie.instances["3"] = new Movie({
      movieId: "3",
      title: "Dangerous Liaisons",
      releaseDate: "1988-12-16",
      director: Person.instances[1],
      actors: ["9", "5"]
    });
    Movie.saveAll();
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
  }
}

function clearData() {
  if (confirm("Do you really want to delete all data?")) {
    try{
      Person.instances = {};
      localStorage["persons"] = "{}";
      Movie.instances = {};
      localStorage["movies"] = "{}";
      console.log("All data deleted.");
    } catch (e) {
      console.log( `${e.constructor.name}: ${e.message}`);
    }
  }
}

export { clearData, createSampleData};