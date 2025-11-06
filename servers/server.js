/*const express = require("express");
const { request } = require("http");
const path = require("path");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
app.use(cors());
const dbPath = path.join(__dirname, "tasks.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(5000, () => {
      console.log("Server Running at http://localhost:5000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
app.get("/",(request,response)=>{
    response.send("Hi");
})


const creativeQuotes = [
  {
    quote: "The sky is not the limit — your mind is.",
    author: "Unknown"
  },
  {
    quote: "Dream in code, live in color, and build what doesn’t exist yet.",
    author: "Tech Philosopher"
  },
  {
    quote: "Every great creation starts with a spark of curiosity.",
    author: "Inventor’s Journal"
  },
  {
    quote: "Your potential doesn’t expire — it evolves.",
    author: "Yamini’s Lab"
  },
  {
    quote: "When passion meets persistence, innovation is born.",
    author: "Motivation Labs"
  }
];

app.get("/api/quote", async (req, res) => {
  try {
    // Fetch from external API (Quotable)
    const response = await fetch("https://zenquotes.io/api/random");
    const data = await response.json();
    const randomIndex = Math.floor(Math.random() * data.length);
    const randomQuote = data[randomIndex];

    // Create a clean JSON object
    const quoteData = {
      quote: randomQuote.q,
      author: randomQuote.a || "Unknown",
      source: "ZenQuotes API"
    };

    res.json(quoteData); 
  } catch (err) {
    console.error("Error fetching or saving quote:", err);
    res.status(500).json({ error: "Failed to fetch or save motivational quote." });
  }
});

app.get("/api/weather", async (req, res) => {
  const city = req.query.city || "Hyderabad";
  const apiKey = process.env.WEATHER_API_KEY;

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: { q: city, units: "metric", appid: apiKey },
      }
    );
    const data = response.data;
    const addWeatherQuery = `INSERT INTO weather_data (city,country,temperature,feels_like,humidity,pressure,weather_description,wind_speed,timestamp) VALUES ('${data.name}','${data.sys.country}',${data.main.temp},${data.main.feels_like},${data.main.humidity},${data.main.pressure},'${data.weather[0].description}',${data.wind.speed},'${new Date()}')`;
    await db.run(addWeatherQuery);
    res.json({
      city: data.name,
      temperature: data.main.temp,
      description: data.weather[0].description
    });
  } catch (error) {
    console.error("Error fetching weather data:", error.response?.data || error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.get("/api/currency", async (req, res) => {
  try {
    const amount = req.query.amount || 95;

    const response = await axios.get("https://api.exchangerate-api.com/v4/latest/INR");
    const rates = response.data.rates;

    const usd = (amount * rates.USD).toFixed(2);
    const eur = (amount * rates.EUR).toFixed(2);

    res.json({ inr: amount, usd, eur });
  } catch (error) {
    console.error("Error fetching currency:", error.message);
    res.status(500).json({ error: "Unable to fetch currency data" });
  }
});*/
const express = require("express");
const path = require("path");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

// Initialize environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Database setup
const dbPath = path.join(__dirname, "tasks.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Start server on PORT (Vercel will provide PORT in process.env.PORT)
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server Running at http://localhost:${PORT}/`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Root route
app.get("/", (req, res) => {
  res.send("Hi, InfoHub Server is running!");
});

// ------------------- Quote API -------------------
const creativeQuotes = [
  {
    quote: "The sky is not the limit — your mind is.",
    author: "Unknown",
  },
  {
    quote: "Dream in code, live in color, and build what doesn’t exist yet.",
    author: "Tech Philosopher",
  },
  {
    quote: "Every great creation starts with a spark of curiosity.",
    author: "Inventor’s Journal",
  },
  {
    quote: "Your potential doesn’t expire — it evolves.",
    author: "Yamini’s Lab",
  },
  {
    quote: "When passion meets persistence, innovation is born.",
    author: "Motivation Labs",
  },
];

app.get("/api/quote", async (req, res) => {
  try {
    // Fetch a random quote from ZenQuotes
    const response = await axios.get("https://zenquotes.io/api/random");
    const data = response.data;

    const randomIndex = Math.floor(Math.random() * data.length);
    const randomQuote = data[randomIndex];

    const quoteData = {
      quote: randomQuote.q,
      author: randomQuote.a || "Unknown",
      source: "ZenQuotes API",
    };

    res.json(quoteData);
  } catch (err) {
    console.error("Error fetching quote:", err.message);
    res.status(500).json({ error: "Failed to fetch motivational quote." });
  }
});

// ------------------- Weather API -------------------
app.get("/api/weather", async (req, res) => {
  const city = req.query.city || "Hyderabad";
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    console.error("WEATHER_API_KEY is missing!");
    return res.status(500).json({ error: "Server misconfigured: missing WEATHER_API_KEY" });
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: { q: city, units: "metric", appid: apiKey },
      }
    );

    const data = response.data;

    // Save to DB
    const addWeatherQuery = `
      INSERT INTO weather_data 
      (city,country,temperature,feels_like,humidity,pressure,weather_description,wind_speed,timestamp) 
      VALUES 
      ('${data.name}','${data.sys.country}',${data.main.temp},${data.main.feels_like},${data.main.humidity},${data.main.pressure},'${data.weather[0].description}',${data.wind.speed},'${new Date()}')`;
    await db.run(addWeatherQuery);

    res.json({
      city: data.name,
      temperature: data.main.temp,
      description: data.weather[0].description,
    });
  } catch (error) {
    console.error("Error fetching weather data:", error.response?.data || error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// ------------------- Currency API -------------------
app.get("/api/currency", async (req, res) => {
  try {
    const amount = req.query.amount || 95;

    const response = await axios.get(
      "https://api.exchangerate-api.com/v4/latest/INR"
    );
    const rates = response.data.rates;

    const usd = (amount * rates.USD).toFixed(2);
    const eur = (amount * rates.EUR).toFixed(2);

    res.json({ inr: amount, usd, eur });
  } catch (error) {
    console.error("Error fetching currency:", error.message);
    res.status(500).json({ error: "Unable to fetch currency data" });
  }
});

// ------------------- Serve React Build -------------------
const buildPath = path.join(__dirname, "../client/myapp/build");
app.use(express.static(buildPath));

app.get("/*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});



