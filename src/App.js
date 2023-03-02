import React, { useCallback, useEffect, useState } from "react";
import MoviesList from "./components/MoviesList";
import "./App.css";
import AddMovie from "./components/AddMovie";

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchMoviesHandler = useCallback(
    async function () {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          "https://my-fetch-app-b1617-default-rtdb.asia-southeast1.firebasedatabase.app/movies.json"
        );
        if (!response.ok) {
          throw new Error("Something Went Wrong! Retrying...");
        }
        const data = await response.json();
        console.log(data);
        const loadedMovies = [];
        for (const key in data) {
          loadedMovies.push({
            id: key,
            title: data[key].title,
            openingText: data[key].openingText,
            releaseDate: data[key].releaseDate,
          });
        }
        setMovies(loadedMovies);
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        console.error(error);
        if (!isRetrying) {
          setIsRetrying(true);
          setTimeout(fetchMoviesHandler, 5000);
        }
      }
      setIsLoading(false);
    },
    [isRetrying]
  );

  function cancelRetryHandler() {
    setIsRetrying(false);
    clearTimeout();
  }

  async function addMovieHandler(movie) {
    const response = await fetch(
      "https://my-fetch-app-b1617-default-rtdb.asia-southeast1.firebasedatabase.app/movies.json",
      {
        method: "POST",
        body: JSON.stringify(movie),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    console.log(data);
  }

  async function deleteMovieHandler(movieId) {
    console.log("Delete");
    try {
      const response = await fetch(
        `https://my-fetch-app-b1617-default-rtdb.asia-southeast1.firebasedatabase.app/movies/${movieId}.json`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete movie.");
      }

      setMovies((prevMovies) =>
        prevMovies.filter((movie) => movie.id !== movieId)
      );
    } catch (error) {
      setError(error.message);
      console.error(error);
    }
  }

  let content = <p>Found no Movies.</p>;

  if (movies.length > 0) {
    content = <MoviesList movies={movies} onDelete={deleteMovieHandler} />;
  }

  if (error) {
    content = (
      <div>
        <p>{error}</p>
        {isRetrying && <button onClick={cancelRetryHandler}>Cancel</button>}
      </div>
    );
  }

  if (isLoading) {
    content = <p>Loading...</p>;
  }

  useEffect(() => {
    fetchMoviesHandler();
  }, [fetchMoviesHandler]);

  return (
    <React.Fragment>
      <section>
        <AddMovie onAddMovie={addMovieHandler} />
      </section>
      <section>
        <button onClick={fetchMoviesHandler}>Fetch Movies</button>
      </section>
      <section>{content}</section>
    </React.Fragment>
  );
}

export default App;
