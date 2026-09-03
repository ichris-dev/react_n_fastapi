import { useState, useRef, useEffect } from 'react'
import './body.css'


function FirstBodySection({ files, loading, error, isSet }) {
  return (
    <>
      <div className='body-container'>

        <div className='left-container'>

          <div className='top-section'>
            <div className='left-section'>
              All endpoints operation
            </div>

            <div className='right-section'>
              Encrypted
            </div>
          </div>


          <div className='title-section'>
            The easiest big file transfer{' '}
            <span className='internet-word'>
              on the internet
            </span>
          </div>


          <div className='sub-section'>
            upload your files, get a 6 digit code, share it with anyone.
            they download instantly. No account, no app, no nosense,
            up to 10 GB and 100 files, gone after 24 hours
          </div>


          <div className='divider'></div>

          <div className='spacer'></div>


          <div className='bottom-section'>

            <div className='left-sec'>
              <div className='text-a'>10 GB</div>
              <div className='text-b'>MAX UPLOAD</div>
            </div>

            <div className='middle-sec'>
              <div className='text-a'>100</div>
              <div className='text-b'>MAX FILES</div>
            </div>

            <div className='right-sec'>
              <div className='text-a'>24hr</div>
              <div className='text-b'>AVAILABLE</div>
            </div>

          </div>

        </div>


        <div className='right-container'>

          <TransferWidget
            files={files}
            isBrowserSet={isSet}
          />

        </div>

      </div>
    </>
  )
}


// -----------------------------------------
// Generate random 6 digit code
// -----------------------------------------

function generateCode() {

  return Math.floor(
    100000 + Math.random() * 900000
  ).toString()

}


// -----------------------------------------
// Format expiration time
// -----------------------------------------

function formatTime(totalSeconds) {

  const h = Math.floor(
    totalSeconds / 3600
  )

  const m = Math.floor(
    (totalSeconds % 3600) / 60
  )

  const s = totalSeconds % 60

  return `${h}h ${m}m ${s}sec`
}


// -----------------------------------------
// Get browser ID
// -----------------------------------------

function getBrowserId() {

  const BROWSER_KEY = 'browser_key'

  let browserId =
    localStorage.getItem(BROWSER_KEY)


  if (!browserId) {

    browserId =
      crypto.randomUUID()

    localStorage.setItem(
      BROWSER_KEY,
      browserId
    )

  }


  return browserId
}


// =========================================
// TRANSFER WIDGET
// =========================================

function TransferWidget({ files, isSet }) {

  const [activeTab, setActiveTab] =
    useState('send')

  const [uploadedCode, setUploadedCode] =
    useState(null)


  const [sentFiles, setSentFiles] =
    useState([])


  const [receivedFiles, setReceivedFiles] =
    useState([])


  const browserId = getBrowserId()


  // ---------------------------------------
  // Separate files according to the
  // current browser's role.
  // ---------------------------------------

  useEffect(() => {

    if (!files) return


    const sent =
      files.filter(
        file =>
          file.sender_id === browserId
      )


    const received =
      files.filter(
        file =>
          file.receiver_id === browserId
      )


    setSentFiles(sent)

    setReceivedFiles(received)

  }, [files, browserId])


  // ---------------------------------------
  // Upload succeeded
  // ---------------------------------------

  const handleUploadSuccess = (
    data,
    code
  ) => {

    setUploadedCode(code)


    setSentFiles(prev => [

      ...data.files,

      ...prev

    ])

  }


  // ---------------------------------------
  // Receiver successfully downloaded
  // ---------------------------------------

  const handleFileReceived = (
    receivedFile
  ) => {

    setReceivedFiles(prev => [

      receivedFile,

      ...prev

    ])

  }


  // ---------------------------------------
  // Upload more
  // ---------------------------------------

  const handleUploadMore = () => {

    setUploadedCode(null)

  }


  return (

    <div className='transfer-container'>


      {/* -------------------------------- */}
      {/* TABS */}
      {/* -------------------------------- */}

      <div className='first-section'>

        <div
          className={`send-section ${
            activeTab === 'send'
              ? 'active-tab'
              : ''
          }`}
          onClick={() =>
            setActiveTab('send')
          }
        >

          <span className='tab-icon'>
            &uarr;
          </span>

          Send a file

        </div>


        <div
          className={`receive-section ${
            activeTab === 'receive'
              ? 'active-tab'
              : ''
          }`}
          onClick={() =>
            setActiveTab('receive')
          }
        >

          <span className='tab-icon'>
            &darr;
          </span>

          Receive a file

        </div>

      </div>


      {/* -------------------------------- */}
      {/* SEND */}
      {/* -------------------------------- */}

      {activeTab === 'send' ? (

        uploadedCode ? (

          <UploadCompleteSection

            code={uploadedCode}

            recentTransfers={sentFiles}

            onUploadMore={
              handleUploadMore
            }

          />

        ) : (

          <UploadSection

            onUploadSuccess={
              handleUploadSuccess
            }

            recentTransfers={
              sentFiles
            }

            isBrowserSet={
              isSet
            }

          />

        )

      ) : (


        /* -------------------------------- */
        /* RECEIVE */
        /* -------------------------------- */

        <ReceiveSection

          recentTransfers={
            receivedFiles
          }

          onFileReceived={
            handleFileReceived
          }

        />

      )}

    </div>

  )
}


// =========================================
// UPLOAD COMPLETE
// =========================================

function UploadCompleteSection({
  code,
  recentTransfers,
  onUploadMore
}) {

  const [secondsLeft, setSecondsLeft] =
    useState(24 * 60 * 60)

  const [copyLabel, setCopyLabel] =
    useState('Copy code')

  const [linkLabel, setLinkLabel] =
    useState('Copy link')


  useEffect(() => {

    const interval =
      setInterval(() => {

        setSecondsLeft(prev =>
          prev > 0
            ? prev - 1
            : 0
        )

      }, 1000)


    return () =>
      clearInterval(interval)

  }, [])


  const handleCopyCode = async () => {

    await navigator.clipboard.writeText(
      code
    )

    setCopyLabel('Copied!')


    setTimeout(
      () =>
        setCopyLabel('Copy code'),
      1500
    )

  }


  const handleCopyLink = async () => {

    await navigator.clipboard.writeText(
      `${window.location.origin}/receive/${code}`
    )

    setLinkLabel('Copied!')


    setTimeout(
      () =>
        setLinkLabel('Copy link'),
      1500
    )

  }


  return (

    <>

      <div className='third-section'>

        <p className='upload-title'>
          Upload Complete
        </p>


        <div className='upload-container'>

          <p className='upload-text'>
            SHARE THIS CODE
          </p>


          <div className='code-boxes'>

            {code
              .split('')
              .map((digit, i) => (

                <div
                  className='code-box'
                  key={i}
                >
                  {digit}
                </div>

              ))}

          </div>


          <p className='expiration-section'>

            Expires in{' '}

            <span className='timer-sec'>
              {formatTime(
                secondsLeft
              )}
            </span>

          </p>


          <div className='transfer-options'>

            <div
              onClick={
                handleCopyCode
              }
            >
              {copyLabel}
            </div>


            <div
              onClick={
                handleCopyLink
              }
            >
              {linkLabel}
            </div>

          </div>


          <button
            className='upload-button'
            onClick={
              onUploadMore
            }
          >
            Upload more files
          </button>

        </div>

      </div>


      <RecentTransfers
        recentTransfers={
          recentTransfers
        }
      />


      <div className='fifth-section'>

        <p>
          Files are encrypted in transit.
          Auto deleted in 24 hours
        </p>

      </div>

    </>

  )
}


// =========================================
// UPLOAD SECTION
// =========================================

function UploadSection({
  onUploadSuccess,
  recentTransfers,
  isSet
}) {

  const fileInputRef =
    useRef(null)

  const [isDragging, setIsDragging] =
    useState(false)

  const [uploading, setUploading] =
    useState(false)


  const handleFiles = async (
    fileList
  ) => {

    if (
      !fileList ||
      fileList.length === 0
    ) {
      return
    }


    const files =
      Array.from(fileList)


    const code =
      generateCode()


    const browserId =
      getBrowserId()


    // -----------------------------------
    // FormData
    // -----------------------------------

    const formData =
      new FormData()


    formData.append(
      'browser_id',
      browserId
    )


    formData.append(
      'file_code',
      code
    )


    formData.append(
      'file_status',
      'sent'
    )


    files.forEach(file => {

      formData.append(
        'files',
        file
      )

    })


    try {

      setUploading(true)


      const response =
        await fetch('/api/save', { method: 'POST', body: formData })


      if (!response.ok) {

        const errorData =
          await response
            .json()
            .catch(() => null)


        throw new Error(
          errorData?.detail ||
          `Upload failed: ${response.status}`
        )

      }


      const data =
        await response.json()


      console.log(
        'Server response:',
        data
      )


      onUploadSuccess(
        data,
        code
      )


    } catch (error) {

      console.error(
        'Upload error:',
        error
      )

    } finally {

      setUploading(false)

    }

  }


  const handleDrop = (e) => {

    e.preventDefault()

    setIsDragging(false)

    handleFiles(
      e.dataTransfer.files
    )

  }


  return (

    <>

      <div className='third-section'>


        <div

          className={`upload-sec-section ${
            isDragging
              ? 'dragging'
              : ''
          }`}

          onClick={() =>
            fileInputRef.current?.click()
          }

          onDragOver={(e) => {

            e.preventDefault()

            setIsDragging(true)

          }}

          onDragLeave={() =>
            setIsDragging(false)
          }

          onDrop={
            handleDrop
          }

        >


          <input

            ref={
              fileInputRef
            }

            type='file'

            multiple

            hidden

            onChange={(e) =>
              handleFiles(
                e.target.files
              )
            }

          />


          <div className='upload-icon'>
            &uarr;
          </div>


          <p>

            {uploading

              ? 'Uploading...'

              : 'Drop files here or click browser'

            }

          </p>


          <p>
            Any file type accepted
          </p>


          <div className='size-choixe'>

            <div>
              Max 100 files
            </div>

            <div>
              Max 10 GB
            </div>

          </div>


        </div>

      </div>


      <RecentTransfers
        recentTransfers={
          recentTransfers
        }
      />


      <div className='fifth-section'>

        <p>
          Files are encrypted in transit.
          Auto deleted in 24 hours
        </p>

      </div>

    </>

  )
}


// =========================================
// RECEIVE SECTION
// =========================================

function ReceiveSection({
  recentTransfers,
  onFileReceived
}) {

  const [digits, setDigits] =
    useState(
      Array(6).fill('')
    )


  const [downloading, setDownloading] =
    useState(false)


  const inputRefs =
    useRef([])


  const code =
    digits.join('')


  const isComplete =
    digits.every(
      digit => digit !== ''
    )


  // ---------------------------------------
  // Digit input
  // ---------------------------------------

  const handleChange = (
    index,
    value
  ) => {

    const clean =
      value
        .replace(/[^0-9]/g, '')
        .slice(-1)


    const next =
      [...digits]


    next[index] =
      clean


    setDigits(next)


    if (
      clean &&
      index < 5
    ) {

      inputRefs
        .current[index + 1]
        ?.focus()

    }

  }


  // ---------------------------------------
  // Backspace
  // ---------------------------------------

  const handleKeyDown = (
    index,
    e
  ) => {

    if (
      e.key === 'Backspace' &&
      !digits[index] &&
      index > 0
    ) {

      inputRefs
        .current[index - 1]
        ?.focus()

    }

  }


  // ---------------------------------------
  // Paste code
  // ---------------------------------------

  const handlePaste = (
    e
  ) => {

    e.preventDefault()


    const pasted =
      e.clipboardData
        .getData('text')
        .replace(
          /[^0-9]/g,
          ''
        )
        .slice(0, 6)


    if (!pasted) return


    const next =
      Array(6).fill('')


    pasted
      .split('')
      .forEach(
        (digit, i) => {
          next[i] = digit
        }
      )


    setDigits(next)

  }


  // ---------------------------------------
  // Download
  // ---------------------------------------

  const handleDownload =
    async () => {

      if (
        !isComplete ||
        downloading
      ) {
        return
      }


      try {

        setDownloading(true)


        const browserId =
          getBrowserId()


        const response =
          await fetch(

            `http://localhost:8000/download/${code}?browser_id=${encodeURIComponent(browserId)}`

          )


        if (!response.ok) {

          const errorData =
            await response
              .json()
              .catch(() => null)


          throw new Error(
            errorData?.detail ||
            `Download failed: ${response.status}`
          )

        }


        // ---------------------------------
        // Get actual file
        // ---------------------------------

        const blob =
          await response.blob()


        // ---------------------------------
        // Get filename sent by FastAPI
        // ---------------------------------

        const contentDisposition =
          response.headers.get(
            'Content-Disposition'
          )


        let fileName =
          'download'


        if (
          contentDisposition
        ) {

          const match =
            contentDisposition.match(
              /filename="?([^"]+)"?/
            )


          if (match) {

            fileName =
              match[1]

          }

        }


        // ---------------------------------
        // Create browser download
        // ---------------------------------

        const url =
          window.URL.createObjectURL(
            blob
          )


        const a =
          document.createElement('a')


        a.href = url

        a.download =
          fileName


        document.body.appendChild(a)

        a.click()

        a.remove()


        window.URL.revokeObjectURL(
          url
        )


        // ---------------------------------
        // Update React UI
        // ---------------------------------

        onFileReceived({

          file_code:
            Number(code),

          file_name:
            fileName,

          file_status:
            'received',

          receiver_id:
            browserId

        })


        // ---------------------------------
        // Clear code
        // ---------------------------------

        setDigits(
          Array(6).fill('')
        )


      } catch (error) {

        console.error(
          'Download error:',
          error
        )

      } finally {

        setDownloading(false)

      }

    }


  return (

    <>

      <div className='third-section'>

        <div className='receive-container'>


          <p className='receive-title'>
            Enter the 6-digit code
          </p>


          <p className='receive-subtitle'>
            Type the code shared with you to download the files
          </p>


          <div
            className='receive-code-boxes'
            onPaste={
              handlePaste
            }
          >

            {digits.map(
              (digit, i) => (

                <input

                  key={i}

                  ref={(el) =>
                    (
                      inputRefs
                        .current[i] = el
                    )
                  }

                  className='receive-code-box'

                  type='text'

                  inputMode='numeric'

                  maxLength={1}

                  value={digit}

                  onChange={(e) =>
                    handleChange(
                      i,
                      e.target.value
                    )
                  }

                  onKeyDown={(e) =>
                    handleKeyDown(
                      i,
                      e
                    )
                  }

                />

              )
            )}

          </div>


          <button

            className='download-button'

            disabled={
              !isComplete ||
              downloading
            }

            onClick={
              handleDownload
            }

          >

            <span className='tab-icon'>
              &darr;
            </span>


            {downloading

              ? 'Downloading...'

              : 'Download files'

            }

          </button>


        </div>

      </div>


      <RecentTransfers
        recentTransfers={
          recentTransfers
        }
      />


      <div className='fifth-section'>

        <p>
          Files are encrypted in transit
          &middot; Auto-deleted after 24 hours
        </p>

      </div>

    </>

  )
}


// =========================================
// RECENT TRANSFERS
// =========================================

function RecentTransfers({
  recentTransfers
}) {

  if (
    !recentTransfers ||
    recentTransfers.length === 0
  ) {

    return null

  }


  return (

    <div className='fourth-section'>

      <p className='recent-text'>
        RECENT TRANSFERS
      </p>


      {recentTransfers.map(
        (file, index) => (

          <div

            className='recents-section'

            key={`${file.file_code}-${file.file_name}-${index}`}

          >

            <p className='file-name'>
              {file.file_name}
            </p>


            <p className='file-code'>
              {file.file_code}
            </p>


            <p className='code-copy'>
              Copy Code
            </p>

          </div>

        )
      )}

    </div>

  )
}

export default FirstBodySection
