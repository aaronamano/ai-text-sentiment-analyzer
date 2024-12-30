import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const analyzeSentiment = async () => {
    try {
      setError(null)
      const response = await axios.post('http://localhost:3000/analyze', { text })
      setResult(response.data)
    } catch (err) {
      setError('Error analyzing sentiment. Please try again.')
      console.error(err)
    }
  }

  return (
    <div className="App">
      <h1>Sentiment Analysis</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to analyze..."
        rows="5"
        cols="50"
      />
      <button onClick={analyzeSentiment}>Analyze</button>
      {error && <p className="error">{error}</p>}
      {result && (
        <div className="result">
          <h2>Analysis Result:</h2>
          <p>Sentiment: {result.sentiment}</p>
          <p>Score: {result.score}</p>
        </div>
      )}
    </div>
  )
}

export default App
