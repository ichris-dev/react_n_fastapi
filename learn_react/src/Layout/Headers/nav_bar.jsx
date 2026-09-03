
import './headers.css'


function Navbar() {

  return (
    <>
      <div className="nav-top">
        <div className='left-container'>
          <div className='logo-container'>
            <div className='logo'>
              <p className='logo-text'>D</p>
            </div>
            <p className='logo-title'>QuickDrop</p>
          </div>
        </div>
        <div className='middle-container'>
          <div className='text-container'>
            <p>How it works</p>
            <p>Apps</p>
            <p>Blog</p>
          </div>
        </div>
        <div className='right-container'>
          <button className='down-button'><p>&darr;</p>Download</button>
        </div>
      </div>
    </>
  )
}

export default Navbar