import './Navbar.css'
function Navbar({ onLogin, language, setLanguage }) {
  const hindi = language === 'hi'

  return (
    <nav className="navbar">
      <a href="#home" className="logo">
        🌿 RE:PLATE
      </a>

      <div className="nav-links">
        <a href="#home">{hindi ? 'होम' : 'Home'}</a>
        <a href="#about">{hindi ? 'हमारे बारे में' : 'About Us'}</a>
        <a href="#how-it-works">
          {hindi ? 'कैसे काम करता है' : 'How It Works'}
        </a>
        <a href="#contact">{hindi ? 'संपर्क' : 'Contact'}</a>
      </div>

      <div className="navbar-actions">
        <button
          className="language-btn"
          onClick={() => setLanguage(hindi ? 'en' : 'hi')}
          type="button"
        >
          {hindi ? 'English' : 'हिंदी'}
        </button>

        <button
          className="navbar-login-btn"
          onClick={onLogin}
          type="button"
        >
          {hindi ? 'लॉगिन' : 'Login'}
        </button>
      </div>
    </nav>
  )
}

export default Navbar