import React, { useCallback, useEffect, useState } from "react";

import MoviesList from "./components/MoviesList";
import "./App.css";

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
        const response = await fetch("https://swapi.dev/api/films/");

        if (!response.ok) {
          throw new Error("Something Went Wrong! Retrying...");
        }

        const data = await response.json();

        const transformedMovies = data.results.map((movieData) => {
          return {
            id: movieData.episode_id,
            title: movieData.title,
            openingText: movieData.opening_crawl,
            releaseDate: movieData.release_date,
          };
        });
        setMovies(transformedMovies);
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

  useEffect(() => {
    fetchMoviesHandler();
  }, [fetchMoviesHandler]);

  function cancelRetryHandler() {
    setIsRetrying(false);
    clearTimeout();
  }

  let content = <p>Found no Movies.</p>;

  if (movies.length > 0) {
    content = <MoviesList movies={movies} />;
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

  return (
    <React.Fragment>
      <section>
        <button onClick={fetchMoviesHandler}>Fetch Movies</button>
      </section>
      <section>{content}</section>
    </React.Fragment>
  );
}

export default App;
