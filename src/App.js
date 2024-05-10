import { useState, useEffect } from "react";
import "./style.css";
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://yuvyitiywterfrewzevh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1dnlpdGl5d3RlcmZyZXd6ZXZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUwODc1NzYsImV4cCI6MjAzMDY2MzU3Nn0.hNYJp1bG0pzamSl1Z0HugFroKwNIGpFdnD4iCZYJ0dI";
const supabase = createClient(supabaseUrl, SUPABASE_KEY);

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

const initialFacts = [
  {
    id: 1,
    text: "React is being developed by Meta (formerly facebook)",
    source: "https://opensource.fb.com/",
    category: "technology",
    votesInteresting: 24,
    votesMindblowing: 9,
    votesFalse: 4,
    createdIn: 2021,
  },
  {
    id: 2,
    text: "Millennial dads spend 3 times as much time with their kids than their fathers spent with them. In 1982, 43% of fathers had never changed a diaper. Today, that number is down to 3%",
    source:
      "https://www.mother.ly/parenting/millennial-dads-spend-more-time-with-their-kids",
    category: "society",
    votesInteresting: 11,
    votesMindblowing: 2,
    votesFalse: 0,
    createdIn: 2019,
  },
  {
    id: 3,
    text: "Lisbon is the capital of Portugal",
    source: "https://en.wikipedia.org/wiki/Lisbon",
    category: "society",
    votesInteresting: 8,
    votesMindblowing: 3,
    votesFalse: 1,
    createdIn: 2015,
  },
];

function App() {
  // 1. define State var

  const [showForm, toggleShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("All");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(
    function () {
      async function fetchInitData() {
        setIsLoading(true);

        let query = supabase.from("facts").select("*");
        if (currentCategory !== "All")
          query = query.eq("category", currentCategory);
        const { data: factsFromBackend, error } = await query
          .order("votesInteresting", { ascending: false })
          .limit(100);

        if (!error) {
          setFacts(factsFromBackend);
          setIsLoading(false);
        } else alert("404");
      }
      fetchInitData();
    },
    [currentCategory]
  );

  return (
    <>
      <Header showForm={showForm} toggleShowForm={toggleShowForm} />

      {/* 2. use state var */}
      {showForm ? (
        <NewFactForm
          facts={facts}
          setFacts={setFacts}
          toggleShowForm={toggleShowForm}
          setIsUploading={setIsLoading}
        />
      ) : null}

      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading ? (
          <Loader />
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p>Loading ...</p>;
}

function Header({ showForm, toggleShowForm }) {
  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" width="68" alt="Today I Learned Logo" />
        <h1>Today I learned</h1>
      </div>

      {/* 3. trigger/update state var*/}
      <button
        className="btn btn-open"
        onClick={() => toggleShowForm((show) => !show)}
      >
        {showForm ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({
  facts,
  setFacts,
  toggleShowForm,
  isUploading,
  setIsUploading,
}) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("http://example.com");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  async function handleSumbit(e) {
    // 1. prevent reload
    e.preventDefault();
    console.log(text, source, category);

    // check the data is valid. If so, create a new fact
    // how to check the data is valid? It means that any input shouldn't be empty
    if (text && text.length <= 200 && isValidHttpUrl(source) && category) {
      // create new fact
      console.log("Data is valid");

      // add a new fact
      // const newFact = {
      //   id: Math.round(Math.random() * 1000000),
      //   text: text,
      //   source: source,
      //   category: category,
      //   votesInteresting: 0,
      //   votesMindblowing: 0,
      //   votesFalse: 0,
      //   createdIn: new Date().getFullYear(),
      // };

      // upload a fact to supabase and get the new fact
      setIsUploading(true);
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([
          {
            text: text,
            source: source,
            category: category,
          },
        ])
        .select();
      setIsUploading(false);

      // display the new fact on the page: add the fact to the state
      setFacts((facts) => [...newFact, ...facts]);

      //  reset the input
      setText("");
      setSource("");
      setCategory("");

      // hide the form
      toggleShowForm((show) => !show);
    } else {
      setError("Data is not valid");
    }
  }

  return (
    <>
      <form className="fact-form" onSubmit={handleSumbit}>
        <input
          type="text"
          placeholder="Share a fact"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isUploading}
        />
        <span className="tag">{200 - text.length}</span>
        <input
          type="text"
          placeholder="Trustworthy source..."
          value={source}
          onChange={(e) => setSource(e.target.value)}
          disabled={isUploading}
        />
        <select
          onChange={(e) => setCategory(e.target.value)}
          disabled={isUploading}
        >
          <option value={category}>Choose category:</option>
          {CATEGORIES.map((token) => (
            <option key={token.name} value={token.name}>
              {token.name.toUpperCase()}
            </option>
          ))}
        </select>

        <button className="btn" disabled={isUploading}>
          Post
        </button>
      </form>
      {error ? <p>{error}</p> : null}
    </>
  );
}

function CategoryFilter({ setCurrentCategory }) {
  // render the filtered facts based on button
  // 先做一個假的 fake button
  // 讓 CATEGORIES 裡的每一種 category 都變成一個 button
  // 可以直接貼上 html，也可以用 array
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("All")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((token) => (
          <CategoryButton
            key={token.name}
            category={token}
            setCurrentCategory={setCurrentCategory}
          />
        ))}
      </ul>
    </aside>
  );
}

function CategoryButton({ category, setCurrentCategory }) {
  return (
    <li className="category">
      <button
        className="btn btn-category"
        style={{
          backgroundColor: category.color,
        }}
        onClick={() => setCurrentCategory(category.name)}
      >
        {category.name}
      </button>
    </li>
  );
}

function FactList({ facts, setFacts }) {
  // how to append new fact to facts?
  return (
    <section>
      <ul className="fact-list">
        {facts.map((f) => (
          <Fact key={f.id} fact={f} setFacts={setFacts} />
        ))}
      </ul>
    </section>
  );
}

function Fact({ fact, setFacts }) {
  async function handleVote() {
    // when user click the button,
    // update the votes and retrieve the updated data from backend

    // 1. how to update the votes?
    // use supabase api
    let query = supabase
      .from("facts")
      .update({ votesInteresting: fact.votesInteresting + 1 })
      .eq("id", fact.id)
      .select();
    const { data: updatedFact, error } = await query;

    if (!error) {
      // only change the votes number of the fact which is updated
      // the other fact should be the same
      setFacts((tokenFact) =>
        tokenFact.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      ); // 我發現這裡如果不寫兩層 => 就一定會報錯，但我沒有很懂為什麼
    }
  }
  return (
    <li className="fact">
      <p>
        {fact.text}
        <a
          className="source"
          href={fact.source}
          target="_blank"
          rel="noreferrer"
        >
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === fact.category)
            .color,
        }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button onClick={handleVote}>👍 {fact.votesInteresting}</button>
        <button>🤯 {fact.votesMindblowing}</button>
        <button>⛔️ {fact.votesFalse}</button>
      </div>
    </li>
  );
}

export default App;
