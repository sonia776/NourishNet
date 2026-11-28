
import { useState } from 'react'

function DonorForm() {
  const [foodName, setFoodName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [category, setCategory] = useState('')
  const [photo, setPhoto] = useState(null)
  const [cookingTime, setCookingTime] = useState('')
  const [donations, setDonations] = useState([])
  const [status, setStatus] = useState({})
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [location, setLocation] = useState('');
  const [pickupDeadline, setPickupDeadline] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault()

    const newDonation = {
      id: Date.now(),
      foodName,
      quantity,
      category,
      location,
      cookingTime,
      pickupDeadline,
      photoURL: URL.createObjectURL(photo)
    }

    setDonations((prev) => [...prev, newDonation])

    alert('Food donation submitted successfully!')

    setFoodName('')
    setQuantity('')
    setCategory('')
    setPhoto(null)
    setCookingTime('')
    setLocation('')
    setPickupDeadline('')
    e.target.reset()
  }
    const handleDelete = (id) => {
  setDonations((prev) =>
    prev.filter((item) => item.id !== id)
  )
}
  const handleStatus = (id) => {
  setStatus((prev) => ({
    ...prev,
    [id]: 'Picked Up'
  }))
}
  const [search, setSearch] = useState('')

  return (
    <div className="donor-form">
      <h2>Donate Food 🍱</h2>
      <p>Share your extra food with people in need.</p>

      <form onSubmit={handleSubmit}>
        <label>Food Name</label>
        <input
          type="text"
          placeholder="Enter food name"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          required
        />

        <label>Quantity</label>
        <input
          type="number"
          placeholder="Enter quantity in plates"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
          required
        />

        <label>Food Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select category</option>
          <option>Cooked Food</option>
          <option>Packed Food</option>
          <option>Raw Food</option>
        </select>

        <label>Upload Food Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
          required
        />

        <label>Food Cooking Time</label>
        <input
          type="datetime-local"
          value={cookingTime}
          onChange={(e) => setCookingTime(e.target.value)}
          required
        />
         <label>Pickup Location</label>
         <input
         type="text"
         placeholder="Enter food pickup address"
         value={location}
         onChange={(e) => setLocation(e.target.value)}
         required
         />
         <label>Food Pickup Deadline</label>
          <input
         type="datetime-local"
         value={pickupDeadline}
         onChange={(e) => setPickupDeadline(e.target.value)}
         required
         />

        <button type="submit">
          Submit Donation
        </button>
      </form>

      <div className="donation-list">
        <h2>Available Food Donations 🍽️</h2>


<select
  value={selectedCategory}
  onChange={(e) => setSelectedCategory(e.target.value)}
>
  <option value="All">All Categories</option>
  <option value="Cooked Food">Cooked Food</option>
  <option value="Packed Food">Packed Food</option>
  <option value="Raw Food">Raw Food</option>
</select>


        <input
        type="text"
        placeholder="Search food..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        />

        {donations.length === 0 ? (
          <p>No food donations available yet.</p>
        ) : (
             donations.filter((item) => {
  const matchesSearch = item.foodName
    .toLowerCase()
    .includes(search.toLowerCase())

  const matchesCategory =
    selectedCategory === 'All' ||
    item.category === selectedCategory

  return matchesSearch && matchesCategory
}).map((item) => (
            <div className="food-card" key={item.id}>
              <img src={item.photoURL} alt={item.foodName} />

              <h3>{item.foodName}</h3>
              <p>Quantity: {item.quantity} plates</p>
              <p>Pickup Location: {item.location}</p>
              <p>
              Pickup Deadline: {new Date(item.pickupDeadline).toLocaleString()}
              </p>
              <p>Category: {item.category}</p>
              <p>
                Cooking Time: {new Date(item.cookingTime).toLocaleString()}
              </p>

              <p>
               Status: {status[item.id] || 'Available'}
               </p>

              <button
              type="button"
             onClick={() => handleStatus(item.id)}
             disabled={status[item.id] === 'Picked Up'}
             >
            {status[item.id] === 'Picked Up'
             ? 'Picked Up'
             : 'Mark as Picked Up'}
             </button>

              <button
               type="button"
               onClick={() => handleDelete(item.id)}
              className="delete-btn"
              >
              Delete Donation
              </button>

            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DonorForm
