
import { useState } from 'react'
import Auth from './components/Auth.jsx'
import './App.css'

function App() {
  const [showAuth, setShowAuth] = useState(false)
  const [language, setLanguage] = useState('en')

  const hindi = language === 'hi'

  if (showAuth) {
    return (
      <div className="auth-screen">
        <button className="back-home-btn" onClick={() => setShowAuth(false)}>
          {hindi ? '← होम पर वापस जाएँ' : '← Back to Home'}
        </button>
        <Auth />
      </div>
    )
  }

  return (
    <div className="app">

      {/* NAVBAR */}
      <header className="navbar">
        <a href="#home" className="logo">
          <span className="logo-leaf">🌿</span>
          <span>RE:PLATE</span>
        </a>

        <nav className="nav-links">
          <a className="active" href="#home">{hindi ? 'होम' : 'Home'}</a>
          <a href="#about">{hindi ? 'हमारे बारे में' : 'About'}</a>
          <a href="#how-it-works">{hindi ? 'कैसे काम करता है' : 'How It Works'}</a>
          <a href="#impact">{hindi ? 'प्रभाव' : 'Impact'}</a>
          <a href="#contact">{hindi ? 'संपर्क' : 'Contact'}</a>
        </nav>

        <div className="nav-actions">
          <button
            className="language-btn"
            onClick={() => setLanguage(hindi ? 'en' : 'hi')}
          >
            🌐 {hindi ? 'हिंदी' : 'English'} ⌄
          </button>
        </div>
      </header>

      <main>

        {/* HOME SECTION */}
        <section className="hero-section" id="home">

          <div className="hero-left">
            <div className="hero-heading">
              <h1>
                {hindi ? (
                  <>खाना बाँटें,<br />खुशियाँ फैलाएँ!</>
                ) : (
                  <>Share Food,<br />Spread <span>Happiness!</span></>
                )}
              </h1>
              <div className="heading-underline"></div>
            </div>

            <p className="hero-description">
              {hindi
                ? 'खाने की बर्बादी कम करें और RE:PLATE के साथ जरूरतमंद लोगों की मदद करें।'
                : 'Reduce food waste and help those in need with RE:PLATE.'}
            </p>

            <div className="food-picture">
              <div className="food-box">
                <div className="food-items">🥬 🍎 🥖 🥛</div>
                <div className="box-front">
                  <span>🌿</span>
                  <strong>RE:PLATE</strong>
                </div>
              </div>
            </div>

            <div className="floating-heart">♡</div>
            <div className="floating-leaf">🌱</div>
          </div>

          {/* WELCOME CARD */}
          <div className="hero-right">
            <div className="welcome-card">
              <h2>
                {hindi ? 'RE:PLATE में आपका स्वागत है!' : <>Welcome to <span>RE:PLATE!</span></>}
              </h2>

              <p className="welcome-subtitle">
                {hindi ? 'जुड़ें। बाँटें। परवाह करें।' : 'Connect. Share. Care.'}
              </p>

              <div className="card-divider"></div>

              <button
                className="login-main-btn"
                onClick={() => setShowAuth(true)}
              >
                <span>👤</span>
                {hindi ? 'लॉगिन / शुरू करें' : 'Login / Get Started'}
                <span>→</span>
              </button>

              <div className="or-divider">
                <span></span>
                {hindi ? 'या' : 'or'}
                <span></span>
              </div>

              <a className="explore-main-btn" href="#about">
                🌿 {hindi ? 'प्लेटफॉर्म देखें' : 'Explore Platform'}
              </a>
            </div>
          </div>

          <div className="hero-ground"></div>
        </section>

        {/* FEATURE STRIP */}
        <section className="feature-strip" id="impact">
          <div className="feature-item">
            <span>♻️</span>
            <p>{hindi ? 'खाने की बर्बादी कम करें' : 'Reduce Food Waste'}</p>
          </div>

          <div className="feature-item">
            <span>👥</span>
            <p>{hindi ? 'समुदायों की मदद करें' : 'Support Communities'}</p>
          </div>

          <div className="feature-item">
            <span>🌿</span>
            <p>{hindi ? 'बदलाव लाएँ' : 'Make a Difference'}</p>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="about-section" id="about">
          <p className="section-label">WHO WE ARE</p>
          <h2>{hindi ? 'RE:PLATE के बारे में' : 'About RE:PLATE'}</h2>

          <p className="section-description">
            {hindi
              ? 'RE:PLATE एक फूड-शेयरिंग प्लेटफॉर्म है जो अतिरिक्त भोजन को जरूरतमंद लोगों तक पहुँचाने में मदद करता है।'
              : 'RE:PLATE is a food-sharing platform that connects food donors with people in need.'}
          </p>

          <div className="about-cards">
            <div className="about-card">
              <span>♻️</span>
              <h3>{hindi ? 'खाना बचाएँ' : 'Save Food'}</h3>
              <p>{hindi ? 'अतिरिक्त खाने को बर्बाद होने से बचाएँ।' : 'Save extra food from going to waste.'}</p>
            </div>

            <div className="about-card">
              <span>🤝</span>
              <h3>{hindi ? 'लोगों की मदद करें' : 'Help People'}</h3>
              <p>{hindi ? 'खाना जरूरतमंद लोगों तक पहुँचाएँ।' : 'Connect surplus food with people in need.'}</p>
            </div>

            <div className="about-card">
              <span>💚</span>
              <h3>{hindi ? 'खुशियाँ फैलाएँ' : 'Spread Happiness'}</h3>
              <p>{hindi ? 'खाना बाँटकर एक अच्छा बदलाव लाएँ।' : 'Make sharing food a beautiful habit.'}</p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how-section" id="how-it-works">
          <p className="section-label">SIMPLE STEPS</p>
          <h2>{hindi ? 'RE:PLATE कैसे काम करता है?' : 'How RE:PLATE Works'}</h2>
          <p className="section-description">
            {hindi ? 'खाना बाँटना बहुत आसान है!' : 'Sharing food is simple. Just follow these three steps!'}
          </p>

          <div className="how-cards">
            <div className="how-card">
              <span>01</span>
              <h3>{hindi ? 'खाना दान करें' : 'Donate Food'}</h3>
              <p>{hindi ? 'अपने अतिरिक्त खाने की जानकारी साझा करें।' : 'Donors share details about their extra food.'}</p>
            </div>

            <div className="how-card">
              <span>02</span>
              <h3>{hindi ? 'जुड़ें' : 'Connect'}</h3>
              <p>{hindi ? 'जरूरतमंद लोग दान करने वालों से जुड़ें।' : 'People in need can connect with food donors.'}</p>
            </div>

            <div className="how-card">
              <span>03</span>
              <h3>{hindi ? 'खुशियाँ बाँटें' : 'Share Happiness'}</h3>
              <p>{hindi ? 'खाना लोगों तक पहुँचाएँ।' : 'Food reaches people instead of going to waste.'}</p>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section className="contact-section" id="contact">
          <p className="section-label">GET IN TOUCH</p>
          <h2>{hindi ? 'संपर्क करें' : 'Contact Us'}</h2>
          <p>
            {hindi
              ? 'हमारे मिशन से जुड़ें और खाने की बर्बादी कम करने में मदद करें!'
              : 'Have questions or want to join our mission? We would love to hear from you!'}
          </p>
          <p>📧 support@replate.com</p>
        </section>

      </main>

      <footer className="footer">
        <h3>🌿 RE:PLATE</h3>
        <p>Share Food, Spread Happiness!</p>
        <p>© 2026 RE:PLATE. All Rights Reserved.</p>
      </footer>

    </div>
  )
}

export default App
