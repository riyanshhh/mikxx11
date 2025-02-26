import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import '../../styles/admin/Bookings.css';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const q = query(collection(db, 'bookings'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      loadBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleDelete = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteDoc(doc(db, 'bookings', bookingId));
        loadBookings();
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const today = new Date();
    const bookingDate = new Date(booking.date);
    
    switch (filter) {
      case 'upcoming':
        return bookingDate >= today;
      case 'past':
        return bookingDate < today;
      case 'confirmed':
        return booking.status === 'confirmed';
      case 'pending':
        return booking.status === 'pending';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="loading-spinner">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Loading bookings...</span>
      </div>
    );
  }

  return (
    <div className="bookings-management">
      <div className="bookings-header">
        <h2>Bookings Management</h2>
        <button className="add-booking-btn">
          <i className="fas fa-plus"></i> New Booking
        </button>
      </div>

      <div className="bookings-filters">
        <button 
          className={filter === 'upcoming' ? 'active' : ''} 
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={filter === 'past' ? 'active' : ''} 
          onClick={() => setFilter('past')}
        >
          Past
        </button>
        <button 
          className={filter === 'confirmed' ? 'active' : ''} 
          onClick={() => setFilter('confirmed')}
        >
          Confirmed
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''} 
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
      </div>

      <div className="calendar-view">
        {/* Calendar implementation will go here */}
      </div>

      <div className="bookings-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Client</th>
              <th>Model</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(booking => (
              <tr key={booking.id}>
                <td>{new Date(booking.date).toLocaleDateString()}</td>
                <td>{booking.time}</td>
                <td>{booking.clientName}</td>
                <td>{booking.modelName}</td>
                <td>{booking.type}</td>
                <td>
                  <select
                    value={booking.status}
                    onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <button 
                    className="view-btn"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(booking.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedBooking && (
        <div className="booking-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Booking Details</h3>
              <button onClick={() => setSelectedBooking(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Client:</label>
                <span>{selectedBooking.clientName}</span>
              </div>
              <div className="detail-row">
                <label>Model:</label>
                <span>{selectedBooking.modelName}</span>
              </div>
              <div className="detail-row">
                <label>Date:</label>
                <span>{new Date(selectedBooking.date).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <label>Time:</label>
                <span>{selectedBooking.time}</span>
              </div>
              <div className="detail-row">
                <label>Type:</label>
                <span>{selectedBooking.type}</span>
              </div>
              <div className="detail-row">
                <label>Location:</label>
                <span>{selectedBooking.location}</span>
              </div>
              <div className="detail-row">
                <label>Notes:</label>
                <p>{selectedBooking.notes}</p>
              </div>
            </div>
            <div className="modal-footer">
              <select
                value={selectedBooking.status}
                onChange={(e) => handleStatusChange(selectedBooking.id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button onClick={() => setSelectedBooking(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bookings; 