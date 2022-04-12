let express = require("express");
let path = require("path");
let { open } = require("sqlite");
let sqlite3 = require("sqlite3");

let app = express();
app.use(express.json());

module.exports = app;

let dbPath = path.join(__dirname, "moviesData.db");

let db = null;

let initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3001, () => {
      console.log("Server Running Successfully...!!!");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/movies/", async (request, response) => {
  let getMovieNameQuery = `
        SELECT movie_name AS movieName
        FROM movie
    `;
  let movieList = await db.all(getMovieNameQuery);
  response.send(movieList);
});

app.post("/movies/", async (request, response) => {
  let movieDetails = request.body;
  let { directorId, movieName, leadActor } = movieDetails;
  let postMovieQuery = `
       INSERT INTO movie
       (director_id, movie_name, lead_actor)
       VALUES (${directorId}, "${movieName}", "${leadActor}")
    `;
  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let getMovieQuery = `
        SELECT movie_id AS movieId, director_id AS directorId, movie_name AS movieName, lead_actor AS leadActor
        FROM movie
        WHERE movie_id = ${movieId};
    `;
  let movie = await db.get(getMovieQuery);
  response.send(movie);
});

app.put("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let movieDetails = request.body;
  let { directorId, movieName, leadActor } = movieDetails;
  let updateMovieQuery = `
       UPDATE movie
       SET director_id = ${directorId}, movie_name = "${movieName}", lead_actor = "${leadActor}"
       WHERE movie_id = ${movieId}
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let deleteMovieQuery = `
       DELETE FROM movie
       WHERE movie_id = ${movieId}
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
