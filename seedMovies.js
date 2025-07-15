import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { Movie } from './models/index.js';
import {fileURLToPath} from "url"; // Adjust path as needed to your models
import { decode } from 'html-entities';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function cleanFact(fact) {
  const noHtmlTags = fact.replace(/<[^>]*>/g, '')
  // Remove HTML tags and decode HTML entities
  return decode(noHtmlTags); // Decode HTML entities
}
async function seedMovies() {
  try {
    const dataFilePath = path.join(__dirname, 'movies_pop-1.json'); // Path to your JSON file
    const jsonData = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

    const movies = jsonData.docs.map((movie) => {
      // Process persons
      const actors = movie.persons
        ?.filter((person) => person.profession === 'актеры')
        .slice(0, 5)
        .map((person) => person.name) || [];
      const directors = movie.persons
        ?.filter((person) => person.profession === 'режиссеры')
        .map((person) => person.name)
        .join(', ') || null;

      // Process facts
      const facts = movie.facts?.slice(0, 3).map((fact) => cleanFact(fact.value)) || [];

      // Process genres and countries
      const genres = movie.genres?.map((genre) => genre.name).join(', ') || null;
      const countries =
        movie.countries?.map((country) => country.name).join(', ') || null;

      // Map the movie data
      return {
        kpId: movie.id,
        type: movie.type,
        name: movie.name,
        description: movie.description,
        slogan: movie.slogan,
        year: movie.year,
        facts: JSON.stringify(facts), // Store as JSON string
        persons: JSON.stringify({ actors, directors }), // Store as JSON string
        genres,
        countries,
        alternativeName: movie.alternativeName,
        shortDescription: movie.shortDescription,
      };
    });

    console.log(movies)

    // Bulk insert movies into the database
    await Movie.bulkCreate(movies, {
      ignoreDuplicates: true
    });

    console.log(`${movies.length} movies have been successfully seeded!`);
  } catch (error) {
    console.error('Error seeding movies:', error);
  }
}

// Run the seed script
seedMovies();
