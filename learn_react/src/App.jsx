import { useState, useEffect } from 'react'

import Navbar from './Layout/Headers/nav_bar'
import FirstBodySection from './Layout/Body/upper_body'
import SecondBodySection from './Layout/Body/middle_body'


function App() {

  // --------------------------------
  // Application state
  // --------------------------------

  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isBrowserIdSet, setBrowserId] = useState(false)


  // --------------------------------
  // Run when application loads
  // --------------------------------

  useEffect(() => {

    // Get existing browser ID
    // or create a new one
    function getBrowserId() {

        const BROWSER_KEY = "browser_key"

        let browserId = localStorage.getItem(BROWSER_KEY)

        console.log("Existing browser ID:", browserId)

        if (!browserId) {

            console.log("No browser ID found. Creating one...")

            browserId = crypto.randomUUID()

            localStorage.setItem(
                BROWSER_KEY,
                browserId
            )

            setBrowserId(true)

            console.log("New browser ID:", browserId)
        }

        return browserId
    }


    // --------------------------------
    // Get files from FastAPI
    // --------------------------------

    async function getFiles(browserId) {

      try {

        const response = await fetch(
          `/api/files?browser_id=${browserId}`,
          {
            method: "GET",
          }
        )


        // Check whether FastAPI responded successfully
        if (!response.ok) {

          throw new Error(
            `Request failed: ${response.status}`
          )

        }


        // Convert response to JavaScript object
        const data = await response.json()


        // Store files in React state
        setFiles(data.files)

      }

      catch (err) {

        console.error(
          "Error getting files:",
          err
        )

        setError(err.message)

      }

      finally {

        setLoading(false)

      }

    }


    // --------------------------------
    // Start application initialization
    // --------------------------------

    const browserId = getBrowserId()

    getFiles(browserId)

  }, [])


  // --------------------------------
  // Application UI
  // --------------------------------

  return (
    <>
      <Navbar />

      <FirstBodySection
        files={files}
        loading={loading}
        error={error}
        isSet={isBrowserIdSet}
      />

    </>
  )
}


export default App
