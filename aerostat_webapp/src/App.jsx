import './App.css'
import Header from './components/Header'
import Home2 from './components/Home2'
import ThemeHandler from './ThemeHandler'

function App() {

  return (
    <>
      <ThemeHandler>
        <Header />
        <Home2 />
      </ThemeHandler>
    </>
  )
}

export default App
