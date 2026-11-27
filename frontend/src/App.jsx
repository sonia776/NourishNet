
import { useState, useEffect, useRef } from 'react'
import './App.css'

// ==========================================
// NOURISHNET - SAFE LOCAL STORAGE
// ==========================================

const loadData = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key)
    return saved !== null ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

const saveData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error('Storage error:', error)
    return false
  }
}

const today = () => {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000)
    .toISOString().split('T')[0]
}

// ==========================================
// MAIN APP
// ==========================================

function App() {
  // DONATIONS
  const [donations, setDonations] = useState(() =>
    loadData('donations', [
      {
        id: 1,
        donor: 'Sample Donor',
        mobile: '9876543210',
        food: 'Fresh Vegetables',
        quantity: '10 kg',
        address: 'Delhi',
        pickupDate: '2026-12-01',
        expiryDate: '2026-12-02',
        status: 'Pending'
      },
      {
        id: 2,
        donor: 'Sample Donor',
        mobile: '9876543210',
        food: 'Rice',
        quantity: '15 kg',
        address: 'Noida',
        pickupDate: '2026-12-02',
        expiryDate: '2026-12-10',
        status: 'Pending'
      },
      {
        id: 3,
        donor: 'Sample Donor',
        mobile: '9876543210',
        food: 'Bread',
        quantity: '20 kg',
        address: 'Greater Noida',
        pickupDate: '2026-12-03',
        expiryDate: '2026-11-28',
        status: 'Pending'
      }
    ])
  )

  // NGO CAPACITY
  const [ngoCapacity, setNgoCapacity] = useState(() =>
    Number(loadData('ngoCapacity', 100))
  )

  // VOLUNTEERS
  const [volunteers, setVolunteers] = useState(() =>
    loadData('volunteers', [])
  )

  // PICKUP TASKS
  const [pickupTasks, setPickupTasks] = useState(() =>
    loadData('pickupTasks', [])
  )

  // ACTIVE VOLUNTEER
  const [activeVolunteer, setActiveVolunteer] = useState(() =>
    loadData('activeVolunteer', '')
  )

  // FORM STATES
  const [submitted, setSubmitted] = useState(false)
  const [volunteerSubmitted, setVolunteerSubmitted] = useState(false)
  const [otpInputs, setOtpInputs] = useState({})
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')

  // NOTIFICATION TIMER
  const messageTimer = useRef(null)

  const showMessage = (text, type = 'success') => {
    setMessage(text)
    setMessageType(type)

    if (messageTimer.current) {
      clearTimeout(messageTimer.current)
    }

    messageTimer.current = setTimeout(() => {
      setMessage('')
    }, 4000)
  }

  useEffect(() => {
    return () => {
      if (messageTimer.current) {
        clearTimeout(messageTimer.current)
      }
    }
  }, [])

  // SAVE DATA
  useEffect(() => {
    saveData('donations', donations)
  }, [donations])

  useEffect(() => {
    saveData('ngoCapacity', ngoCapacity)
  }, [ngoCapacity])

  useEffect(() => {
    saveData('volunteers', volunteers)
  }, [volunteers])

  useEffect(() => {
    saveData('pickupTasks', pickupTasks)
  }, [pickupTasks])

  useEffect(() => {
    saveData('activeVolunteer', activeVolunteer)
  }, [activeVolunteer])

  // ==========================================
  // DONATION MANAGEMENT
  // ==========================================

  const handleSubmit = (e) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const quantity = Number(formData.get('quantity'))
    const expiryDate = formData.get('expiryDate')
    const pickupDate = formData.get('pickupDate')

    if (expiryDate < today()) {
      showMessage('Food expiry date cannot be in the past.', 'error')
      return
    }

    if (pickupDate < today()) {
      showMessage('Pickup date cannot be in the past.', 'error')
      return
    }

    if (expiryDate < pickupDate) {
      showMessage('Food must not expire before pickup date.', 'error')
      return
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      showMessage('Enter a valid food quantity.', 'error')
      return
    }

    const newDonation = {
      id: Date.now(),
      donor: formData.get('donor'),
      mobile: formData.get('mobile'),
      food: formData.get('food'),
      quantity: `${quantity} kg`,
      address: formData.get('address'),
      pickupDate,
      expiryDate,
      status: 'Pending'
    }

    setDonations(prev => [...prev, newDonation])
    e.currentTarget.reset()
    setSubmitted(true)

    showMessage('Donation submitted successfully!')
  }

  // NGO ACCEPT / REJECT DONATION
  const handleDonationStatus = (id, status) => {
    const donation = donations.find(d => d.id === id)

    if (!donation || donation.status !== 'Pending') {
      showMessage('This donation has already been processed.', 'error')
      return
    }

    const quantity = Number(
      donation.quantity.replace(' kg', '')
    )

    if (status === 'Accepted') {
      if (usedCapacity + quantity > ngoCapacity) {
        showMessage('Not enough NGO storage capacity!', 'error')
        return
      }
    }

    setDonations(prev =>
      prev.map(d =>
        d.id === id ? { ...d, status } : d
      )
    )

    showMessage(`Donation ${status.toLowerCase()} successfully!`)
  }

  // DONATION COUNTS
  const pendingCount = donations.filter(
    d => d.status === 'Pending'
  ).length

  const acceptedCount = donations.filter(
    d => d.status === 'Accepted'
  ).length

  const rejectedCount = donations.filter(
    d => d.status === 'Rejected'
  ).length

  // CAPACITY
  const usedCapacity = donations.reduce((total, donation) => {
    if (donation.status !== 'Accepted') return total

    const match = donation.quantity.match(
      /^(\d+(?:\.\d+)?)\s*kg$/i
    )

    return total + (match ? Number(match[1]) : 0)
  }, 0)

  const availableCapacity = Math.max(
    ngoCapacity - usedCapacity,
    0
  )

  const capacityPercentage = Math.min(
    (usedCapacity / Math.max(ngoCapacity, 1)) * 100,
    100
  )

  // EXPIRY COUNTDOWN
  const getExpiryInfo = (expiryDate) => {
    if (!expiryDate) {
      return { text: 'Expiry date unavailable', expired: false }
    }

    const expiry = new Date(`${expiryDate}T00:00:00`)
    const current = new Date()
    current.setHours(0, 0, 0, 0)

    const difference = Math.ceil(
      (expiry - current) / 86400000
    )

    if (Number.isNaN(difference)) {
      return { text: 'Invalid expiry date', expired: false }
    }

    if (difference < 0) {
      return {
        text: `Expired ${Math.abs(difference)} day(s) ago`,
        expired: true
      }
    }

    if (difference === 0) {
      return {
        text: 'Expires today!',
        expired: false,
        urgent: true
      }
    }

    return {
      text: `${difference} day(s) remaining`,
      expired: false,
      urgent: difference <= 2
    }
  }

  // ==========================================
  // VOLUNTEER REGISTRATION
  // ==========================================

  const handleVolunteerSubmit = (e) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    const email = formData.get('email').trim().toLowerCase()

    if (volunteers.some(v => v.email.toLowerCase() === email)) {
      showMessage('This email is already registered.', 'error')
      return
    }

    const newVolunteer = {
      id: Date.now(),
      name: formData.get('name'),
      email,
      mobile: formData.get('mobile'),
      city: formData.get('city'),
      interest: formData.get('interest'),
      reason: formData.get('reason'),
      status: 'Registered'
    }

    setVolunteers(prev => [...prev, newVolunteer])
    e.currentTarget.reset()
    setVolunteerSubmitted(true)

    showMessage('Volunteer registered successfully!')
  }

  // ==========================================
  // VOLUNTEER PICKUP REQUEST
  // ==========================================

  const requestPickup = (donation) => {
    if (!activeVolunteer) {
      showMessage('Please select your volunteer profile.', 'error')
      return
    }

    const volunteer = volunteers.find(
      v => String(v.id) === String(activeVolunteer)
    )

    if (!volunteer) {
      showMessage('Volunteer profile not found.', 'error')
      return
    }

    if (donation.status !== 'Accepted') {
      showMessage('Only accepted donations can be requested.', 'error')
      return
    }

    const alreadyRequested = pickupTasks.some(
      task => task.donationId === donation.id &&
        task.status !== 'Rejected'
    )

    if (alreadyRequested) {
      showMessage('A pickup request already exists.', 'error')
      return
    }

    const task = {
      id: Date.now(),
      donationId: donation.id,
      volunteerId: activeVolunteer,
      volunteerName: volunteer.name,
      food: donation.food,
      quantity: donation.quantity,
      address: donation.address,
      pickupDate: donation.pickupDate,
      status: 'Requested',
      otp: String(
        Math.floor(100000 + Math.random() * 900000)
      ),
      otpVerified: false,
      proofName: '',
      proofData: '',
      proofUploaded: false,
      createdAt: new Date().toISOString()
    }

    setPickupTasks(prev => [...prev, task])
    showMessage('Pickup request sent to NGO successfully!')
  }

  // ==========================================
  // NGO PICKUP REQUEST APPROVAL
  // ==========================================

  const handlePickupRequestStatus = (taskId, status) => {
    const task = pickupTasks.find(t => t.id === taskId)

    if (!task || task.status !== 'Requested') {
      showMessage('This request has already been processed.', 'error')
      return
    }

    if (!['Approved', 'Rejected'].includes(status)) {
      return
    }

    setPickupTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              status,
              reviewedAt: new Date().toISOString()
            }
          : t
      )
    )

    showMessage(
      status === 'Approved'
        ? 'Pickup request approved successfully!'
        : 'Pickup request rejected.'
    )
  }

  // ==========================================
  // OTP VERIFICATION
  // ==========================================

  const verifyOTP = (taskId) => {
    const task = pickupTasks.find(t => t.id === taskId)
    const enteredOTP = otpInputs[taskId]

    if (!task || task.status !== 'Approved') {
      showMessage('This pickup is not approved.', 'error')
      return
    }

    if (!enteredOTP || !/^\d{6}$/.test(enteredOTP)) {
      showMessage('Enter a valid 6 digit OTP.', 'error')
      return
    }

    if (enteredOTP === task.otp) {
      setPickupTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? {
                ...t,
                otpVerified: true,
                status: 'Picked Up',
                pickedUpAt: new Date().toISOString()
              }
            : t
        )
      )

      setOtpInputs(prev => ({
        ...prev,
        [taskId]: ''
      }))

      showMessage('OTP verified! Pickup confirmed.')
    } else {
      showMessage('Incorrect OTP. Please try again.', 'error')
    }
  }

  // ==========================================
  // PHOTO PROOF UPLOAD
  // ==========================================

  const handleProofUpload = (taskId, file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showMessage('Please upload a valid image.', 'error')
      return
    }

    // Keep image size limited for localStorage
    if (file.size > 1024 * 1024) {
      showMessage('Image must be below 1 MB.', 'error')
      return
    }

    const task = pickupTasks.find(t => t.id === taskId)

    if (!task || task.status !== 'Picked Up') {
      showMessage('Pickup must be confirmed first.', 'error')
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const imageData = reader.result

      setPickupTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? {
                ...t,
                proofName: file.name,
                proofData: imageData,
                proofUploaded: true
              }
            : t
        )
      )

      showMessage('Delivery photo uploaded successfully!')
    }

    reader.onerror = () => {
      showMessage('Unable to read image file.', 'error')
    }

    reader.readAsDataURL(file)
  }

  // ==========================================
  // COMPLETE DELIVERY
  // ==========================================

  const completeDelivery = (taskId) => {
    const task = pickupTasks.find(t => t.id === taskId)

    if (!task || task.status !== 'Picked Up') {
      showMessage('Pickup must be completed first.', 'error')
      return
    }

    if (!task.proofUploaded || !task.proofData) {
      showMessage('Please upload delivery photo proof first.', 'error')
      return
    }

    setPickupTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              status: 'Delivered',
              deliveredAt: new Date().toISOString()
            }
          : t
      )
    )

    showMessage('Delivery completed successfully!')
  }

  // ==========================================
  // DASHBOARD CALCULATIONS
  // ==========================================

  const myTasks = pickupTasks.filter(
    task => String(task.volunteerId) === String(activeVolunteer)
  )

  const completedTasks = myTasks.filter(
    task => task.status === 'Delivered'
  ).length

  const pendingTasks = myTasks.filter(
    task => !['Delivered', 'Rejected'].includes(task.status)
  ).length

  const availableDonations = donations.filter(
    donation =>
      donation.status === 'Accepted' &&
      !pickupTasks.some(task =>
        task.donationId === donation.id &&
        task.status !== 'Rejected'
      )
  )

  const selectedVolunteer = volunteers.find(
    v => String(v.id) === String(activeVolunteer)
  )

  const requestedTasks = pickupTasks.filter(
    t => t.status === 'Requested'
  )

  const approvedTasks = pickupTasks.filter(
    t => t.status === 'Approved'
  )

  const rejectedTasks = pickupTasks.filter(
    t => t.status === 'Rejected'
  )

  const pickedUpTasks = pickupTasks.filter(
    t => t.status === 'Picked Up'
  )

  const deliveredTasks = pickupTasks.filter(
    t => t.status === 'Delivered'
  )

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="app">

      {/* NOTIFICATION */}

      {message && (
        <div
          className={`app-message ${messageType}`}
          role="status"
          aria-live="polite"
        >
          <span>{message}</span>
          <button
            type="button"
            aria-label="Close notification"
            onClick={() => setMessage('')}
          >
            ×
          </button>
        </div>
      )}

      {/* NAVBAR */}

      <nav className="navbar">
        <h2>🌱 NourishNet</h2>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About Us</a>
          <a href="#impact">Our Impact</a>
          <a href="#donate">Donate Food</a>
          <a href="#ngo">NGO Dashboard</a>
          <a href="#volunteer">Volunteer</a>
          <a href="#volunteer-dashboard">Volunteer Dashboard</a>
        </div>

        <a href="#donate">
          <button className="nav-btn" type="button">Join Us</button>
        </a>
      </nav>

      {/* HERO */}

      <section className="hero" id="home">
        <div className="hero-content">
          <p className="tagline">
            TOGETHER FOR A BETTER TOMORROW
          </p>

          <h1>
            Share Food.
            <br />
            <span>Spread Happiness.</span>
          </h1>

          <p>
            Connecting food donors, NGOs and volunteers
            to fight hunger and reduce food waste.
          </p>

          <div className="hero-buttons">
            <a href="#donate">
              <button type="button">Donate Food</button>
            </a>

            <a href="#volunteer">
              <button type="button" className="secondary-btn">
                Become a Volunteer
              </button>
            </a>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80"
            alt="Fresh food donation"
          />
        </div>
      </section>

      {/* ABOUT */}

      <section className="about" id="about">
        <p className="tagline">WHO WE ARE</p>
        <h2>Making a Difference Together</h2>

        <p>
          Every meal shared brings hope to someone in need.
          NourishNet connects people who want to help with
          communities that need support.
        </p>
      </section>

      {/* IMPACT */}

      <section className="impact" id="impact">
        <p className="tagline">OUR MISSION</p>
        <h2>Small Actions, Big Impact</h2>

        <div className="impact-cards">
          <div className="impact-card">
            <span>🍱</span>
            <h3>Food Donation</h3>
            <p>Share surplus food with people who need it.</p>
          </div>

          <div className="impact-card">
            <span>🤝</span>
            <h3>Volunteer Support</h3>
            <p>Help collect and distribute food donations.</p>
          </div>

          <div className="impact-card">
            <span>🏢</span>
            <h3>NGO Network</h3>
            <p>Connect NGOs with donors and volunteers.</p>
          </div>
        </div>
      </section>

      {/* DONATION FORM */}

      <section className="donation-section" id="donate">
        <div className="donation-container">
          <p className="tagline">BE A FOOD HERO</p>
          <h2>Donate Food</h2>

          <p className="form-description">
            Your extra food can make someone's day better.
          </p>

          {submitted ? (
            <div className="success-message" role="status">
              <h3>🎉 Thank You!</h3>
              <p>Your donation has been submitted successfully.</p>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
              >
                Submit Another Donation
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="donation-form">

              <label htmlFor="donor">Donor Name</label>
              <input
                id="donor"
                type="text"
                name="donor"
                placeholder="Enter your full name"
                required
              />

              <label htmlFor="donor-mobile">Mobile Number</label>
              <input
                id="donor-mobile"
                type="tel"
                name="mobile"
                placeholder="Enter mobile number"
                pattern="[0-9]{10}"
                maxLength="10"
                required
              />

              <label htmlFor="food">Food Type</label>
              <select id="food" name="food" required defaultValue="">
                <option value="" disabled>Select food type</option>
                <option>Cooked Food</option>
                <option>Raw Food</option>
                <option>Packaged Food</option>
                <option>Fruits and Vegetables</option>
              </select>

              <label htmlFor="quantity">Food Quantity (kg)</label>
              <input
                id="quantity"
                type="number"
                name="quantity"
                min="0.1"
                step="0.1"
                placeholder="Enter quantity in kg"
                required
              />

              <label htmlFor="address">Pickup Address</label>
              <textarea
                id="address"
                name="address"
                placeholder="Enter complete pickup address"
                required
              />

              <label htmlFor="pickupDate">Pickup Date</label>
              <input
                id="pickupDate"
                type="date"
                name="pickupDate"
                min={today()}
                required
              />

              <label htmlFor="expiryDate">Food Expiry Date</label>
              <input
                id="expiryDate"
                type="date"
                name="expiryDate"
                min={today()}
                required
              />

              <button type="submit" className="submit-btn">
                Submit Donation
              </button>
            </form>
          )}
        </div>
      </section>

      {/* NGO DASHBOARD */}

      <section className="ngo-dashboard" id="ngo">
        <h2>NGO Dashboard</h2>
        <p>Manage incoming food donations and pickup requests</p>

        {/* DONATION STATISTICS */}

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>{donations.length}</h3>
            <p>Total Donations</p>
          </div>

          <div className="stat-card">
            <h3>{pendingCount}</h3>
            <p>Pending</p>
          </div>

          <div className="stat-card">
            <h3>{acceptedCount}</h3>
            <p>Accepted</p>
          </div>

          <div className="stat-card">
            <h3>{rejectedCount}</h3>
            <p>Rejected</p>
          </div>
        </div>

        {/* CAPACITY MANAGEMENT */}

        <div className="capacity-card">
          <h3>NGO Storage Capacity</h3>

          <label htmlFor="capacity">Total Capacity (kg)</label>

          <input
            id="capacity"
            type="number"
            min={Math.max(1, usedCapacity)}
            value={ngoCapacity}
            onChange={e => {
              const value = Number(e.target.value)

              if (value < usedCapacity) {
                showMessage(
                  'Capacity cannot be less than used capacity.',
                  'error'
                )
                return
              }

              setNgoCapacity(Math.max(1, value))
            }}
          />

          <p>Used Capacity: {usedCapacity} kg</p>
          <p>Available Capacity: {availableCapacity} kg</p>

          <div
            className="capacity-bar"
            role="progressbar"
            aria-valuenow={Math.round(capacityPercentage)}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="NGO storage capacity used"
          >
            <div
              className="capacity-progress"
              style={{ width: `${capacityPercentage}%` }}
            />
          </div>

          {availableCapacity === 0 && (
            <p className="capacity-warning">
              ⚠️ Storage Capacity Full!
            </p>
          )}
        </div>

        {/* DONATION LIST */}

        <div className="donation-list">
          {donations.length === 0 ? (
            <p>No donations available yet.</p>
          ) : (
            donations.map(donation => {
              const expiry = getExpiryInfo(donation.expiryDate)

              return (
                <div className="ngo-donation-card" key={donation.id}>
                  <h3>{donation.food}</h3>

                  <p>Donor: {donation.donor}</p>
                  <p>Mobile: {donation.mobile}</p>
                  <p>Quantity: {donation.quantity}</p>
                  <p>Address: {donation.address}</p>
                  <p>Pickup Date: {donation.pickupDate}</p>
                  <p>Expiry Date: {donation.expiryDate}</p>

                  <p
                    style={{
                      color: expiry.expired
                        ? '#d94848'
                        : expiry.urgent
                          ? '#d18b16'
                          : '#23764b',
                      fontWeight: 'bold'
                    }}
                  >
                    ⏳ Food Expiry: {expiry.text}
                  </p>

                  <p>
                    Status: <strong>{donation.status}</strong>
                  </p>

                  {donation.status === 'Pending' && (
                    <div className="ngo-actions">
                      <button
                        type="button"
                        className="accept-btn"
                        disabled={
                          usedCapacity +
                          Number(donation.quantity.replace(' kg', '')) >
                          ngoCapacity
                        }
                        onClick={() =>
                          handleDonationStatus(donation.id, 'Accepted')
                        }
                        aria-label={`Accept ${donation.food} donation`}
                      >
                        Accept
                      </button>

                      <button
                        type="button"
                        className="reject-btn"
                        onClick={() =>
                          handleDonationStatus(donation.id, 'Rejected')
                        }
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* NGO PICKUP APPROVAL PANEL */}

        <div className="capacity-card">
          <h3>📦 Volunteer Pickup Approval</h3>
          <p>Review volunteer pickup requests and approve or reject them.</p>

          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>{requestedTasks.length}</h3>
              <p>Requested</p>
            </div>

            <div className="stat-card">
              <h3>{approvedTasks.length}</h3>
              <p>Approved</p>
            </div>

            <div className="stat-card">
              <h3>{rejectedTasks.length}</h3>
              <p>Rejected</p>
            </div>

            <div className="stat-card">
              <h3>{deliveredTasks.length}</h3>
              <p>Delivered</p>
            </div>
          </div>

          {pickupTasks.length === 0 ? (
            <p>No volunteer pickup requests yet.</p>
          ) : (
            <div className="donation-list">
              {pickupTasks.map(task => (
                <div className="ngo-donation-card" key={task.id}>
                  <h3>{task.food}</h3>

                  <p>Volunteer: {task.volunteerName}</p>
                  <p>Quantity: {task.quantity}</p>
                  <p>Pickup Address: {task.address}</p>
                  <p>Pickup Date: {task.pickupDate}</p>

                  <p>
                    Request Status: <strong>{task.status}</strong>
                  </p>

                  {task.status === 'Requested' && (
                    <div className="ngo-actions">
                      <button
                        type="button"
                        className="accept-btn"
                        onClick={() =>
                          handlePickupRequestStatus(task.id, 'Approved')
                        }
                      >
                        Approve Request
                      </button>

                      <button
                        type="button"
                        className="reject-btn"
                        onClick={() =>
                          handlePickupRequestStatus(task.id, 'Rejected')
                        }
                      >
                        Reject Request
                      </button>
                    </div>
                  )}

                  {task.status === 'Approved' && (
                    <p className="completed-message">
                      ✅ Pickup request approved.
                    </p>
                  )}

                  {task.status === 'Rejected' && (
                    <p className="capacity-warning">
                      ❌ Pickup request rejected.
                    </p>
                  )}

                  {task.status === 'Picked Up' && (
                    <p>🚚 Food picked up by volunteer.</p>
                  )}

                  {task.status === 'Delivered' && (
                    <div>
                      <p className="completed-message">
                        ✅ Food delivered successfully.
                      </p>

                      {task.proofData && (
                        <img
                          src={task.proofData}
                          alt={`Delivery proof for ${task.food}`}
                          className="proof-image"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* VOLUNTEER REGISTRATION */}

      <section className="volunteer-section" id="volunteer">
        <div className="volunteer-container">
          <p className="tagline">MAKE A DIFFERENCE</p>
          <h2>Become a Volunteer</h2>

          <p>Join our mission and help us spread happiness.</p>

          {volunteerSubmitted ? (
            <div className="success-message" role="status">
              <h3>🎉 Welcome to NourishNet!</h3>
              <p>Your registration has been submitted.</p>

              <button
                type="button"
                onClick={() => setVolunteerSubmitted(false)}
              >
                Register Another Volunteer
              </button>
            </div>
          ) : (
            <form
              className="donation-form"
              onSubmit={handleVolunteerSubmit}
            >
              <label htmlFor="vol-name">Full Name</label>
              <input
                id="vol-name"
                type="text"
                name="name"
                placeholder="Enter your name"
                required
              />

              <label htmlFor="vol-email">Email Address</label>
              <input
                id="vol-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                required
              />

              <label htmlFor="vol-mobile">Mobile Number</label>
              <input
                id="vol-mobile"
                type="tel"
                name="mobile"
                placeholder="10 digit mobile number"
                pattern="[0-9]{10}"
                maxLength="10"
                required
              />

              <label htmlFor="vol-city">City</label>
              <input
                id="vol-city"
                type="text"
                name="city"
                placeholder="Enter your city"
                required
              />

              <label htmlFor="interest">Area of Interest</label>
              <select
                id="interest"
                name="interest"
                required
                defaultValue=""
              >
                <option value="" disabled>Select your interest</option>
                <option>Food Distribution</option>
                <option>Food Collection</option>
                <option>NGO Support</option>
                <option>Event Management</option>
              </select>

              <label htmlFor="reason">
                Why do you want to volunteer?
              </label>

              <textarea
                id="reason"
                name="reason"
                placeholder="Tell us about yourself..."
                required
              />

              <button type="submit" className="submit-btn">
                Register as Volunteer
              </button>
            </form>
          )}
        </div>
      </section>

      {/* VOLUNTEER DASHBOARD */}

      <section
        className="ngo-dashboard"
        id="volunteer-dashboard"
      >
        <h2>Volunteer Dashboard</h2>

        <p>Manage registrations, pickup requests and deliveries</p>

        {/* VOLUNTEER STATISTICS */}

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>{volunteers.length}</h3>
            <p>Total Volunteers</p>
          </div>

          <div className="stat-card">
            <h3>{pickupTasks.length}</h3>
            <p>Total Pickup Requests</p>
          </div>

          <div className="stat-card">
            <h3>{pickedUpTasks.length}</h3>
            <p>Picked Up</p>
          </div>

          <div className="stat-card">
            <h3>{deliveredTasks.length}</h3>
            <p>Delivered</p>
          </div>
        </div>

        {/* VOLUNTEER PROFILE */}

        <div className="capacity-card">
          <h3>Volunteer Profile</h3>

          <label htmlFor="activeVolunteer">
            Select Your Volunteer Profile
          </label>

          <select
            id="activeVolunteer"
            value={activeVolunteer}
            onChange={e => {
              setActiveVolunteer(e.target.value)
              setOtpInputs({})
            }}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: '1px solid #d7e2d7'
            }}
          >
            <option value="">Select Volunteer</option>

            {volunteers.map(volunteer => (
              <option
                key={volunteer.id}
                value={String(volunteer.id)}
              >
                {volunteer.name} - {volunteer.city}
              </option>
            ))}
          </select>

          {selectedVolunteer && (
            <div style={{ marginTop: 15 }}>
              <p><strong>Name:</strong> {selectedVolunteer.name}</p>
              <p><strong>Email:</strong> {selectedVolunteer.email}</p>
              <p><strong>City:</strong> {selectedVolunteer.city}</p>
              <p><strong>Interest:</strong> {selectedVolunteer.interest}</p>
              <p><strong>Active Tasks:</strong> {pendingTasks}</p>
              <p><strong>Completed Deliveries:</strong> {completedTasks}</p>
            </div>
          )}
        </div>

        {/* AVAILABLE PICKUP REQUESTS */}

        <div className="capacity-card">
          <h3>📦 Available Pickup Requests</h3>
          <p>Accepted donations available for volunteer pickup.</p>

          {!activeVolunteer ? (
            <p>Please select your volunteer profile first.</p>
          ) : availableDonations.length === 0 ? (
            <p>No available pickup requests right now.</p>
          ) : (
            <div className="donation-list">
              {availableDonations.map(donation => (
                <div className="ngo-donation-card" key={donation.id}>
                  <h3>{donation.food}</h3>

                  <p>Quantity: {donation.quantity}</p>
                  <p>Pickup Address: {donation.address}</p>
                  <p>Pickup Date: {donation.pickupDate}</p>

                  <button
                    type="button"
                    className="accept-btn"
                    onClick={() => requestPickup(donation)}
                  >
                    Request Pickup
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MY PICKUP AND DELIVERY TASKS */}

        <div className="capacity-card">
          <h3>🚚 My Pickup & Delivery Tasks</h3>

          {!activeVolunteer ? (
            <p>Please select a volunteer profile to view tasks.</p>
          ) : myTasks.length === 0 ? (
            <p>No pickup tasks assigned yet.</p>
          ) : (
            <div className="donation-list">
              {myTasks.map(task => (
                <div className="ngo-donation-card" key={task.id}>
                  <h3>{task.food}</h3>

                  <p>Volunteer: {task.volunteerName}</p>
                  <p>Quantity: {task.quantity}</p>
                  <p>Pickup Address: {task.address}</p>
                  <p>Pickup Date: {task.pickupDate}</p>

                  <p>
                    Status: <strong>{task.status}</strong>
                  </p>

                  {/* REQUESTED */}

                  {task.status === 'Requested' && (
                    <div className="assignment-box">
                      <h4>⏳ Waiting for NGO Approval</h4>
                      <p>
                        Your pickup request has been sent to the NGO.
                        Please wait for approval.
                      </p>
                    </div>
                  )}

                  {/* REJECTED */}

                  {task.status === 'Rejected' && (
                    <div className="completed-message">
                      ❌ Your pickup request was rejected by the NGO.
                    </div>
                  )}

                  {/* APPROVED AND OTP */}

                  {task.status === 'Approved' && (
                    <div className="verification-box">
                      <h4>🔐 Pickup OTP Verification</h4>

                      <p>
                        Demo OTP: <strong>{task.otp}</strong>
                      </p>

                      <p>
                        This is a demo OTP. Real OTP delivery
                        requires backend/SMS integration.
                      </p>

                      <label htmlFor={`otp-${task.id}`}>
                        Enter 6 digit OTP
                      </label>

                      <input
                        id={`otp-${task.id}`}
                        type="text"
                        inputMode="numeric"
                        maxLength="6"
                        pattern="[0-9]{6}"
                        placeholder="Enter OTP"
                        value={otpInputs[task.id] || ''}
                        onChange={e =>
                          setOtpInputs(prev => ({
                            ...prev,
                            [task.id]: e.target.value.replace(/\D/g, '')
                          }))
                        }
                      />

                      <button
                        type="button"
                        className="accept-btn"
                        onClick={() => verifyOTP(task.id)}
                      >
                        Verify OTP
                      </button>
                    </div>
                  )}

                  {/* PICKED UP AND PHOTO PROOF */}

                  {task.status === 'Picked Up' && (
                    <div className="verification-box">
                      <h4>📸 Delivery Photo Proof</h4>

                      <p>
                        Upload a photograph as proof of delivery.
                      </p>

                      <label htmlFor={`proof-${task.id}`}>
                        Select Delivery Photo
                      </label>

                      <input
                        id={`proof-${task.id}`}
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          handleProofUpload(
                            task.id,
                            e.target.files?.[0]
                          )
                          e.target.value = ''
                        }}
                      />

                      {task.proofData && (
                        <div>
                          <p>Selected Photo: {task.proofName}</p>

                          <img
                            src={task.proofData}
                            alt="Delivery proof preview"
                            className="proof-image"
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        className="accept-btn"
                        disabled={!task.proofUploaded}
                        onClick={() => completeDelivery(task.id)}
                      >
                        Complete Delivery
                      </button>
                    </div>
                  )}

                  {/* DELIVERED */}

                  {task.status === 'Delivered' && (
                    <div className="success-message">
                      <h3>✅ Delivery Completed!</h3>
                      <p>Food delivery has been marked successful.</p>
                      <p>Photo: {task.proofName}</p>

                      {task.proofData && (
                        <img
                          src={task.proofData}
                          alt="Completed delivery proof"
                          className="proof-image"
                        />
                      )}

                      {task.deliveredAt && (
                        <p>
                          Delivered on:{' '}
                          {new Date(task.deliveredAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ALL REGISTERED VOLUNTEERS */}

        <div className="capacity-card">
          <h3>👥 Registered Volunteers</h3>

          <div className="donation-list">
            {volunteers.length === 0 ? (
              <p>No volunteers registered yet.</p>
            ) : (
              volunteers.map(volunteer => (
                <div
                  className="ngo-donation-card"
                  key={volunteer.id}
                >
                  <h3>{volunteer.name}</h3>

                  <p>Email: {volunteer.email}</p>
                  <p>Mobile: {volunteer.mobile}</p>
                  <p>City: {volunteer.city}</p>
                  <p>Interest: {volunteer.interest}</p>
                  <p>Reason: {volunteer.reason}</p>
                  <p>Status: {volunteer.status}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </section>

      {/* FOOTER */}

      <footer>
        <h2>🌱 NourishNet</h2>
        <p>Share Food. Spread Happiness.</p>
        <p>© 2026 NourishNet. All rights reserved.</p>
      </footer>

    </div>
  )
}

export default App