import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Column 1 */}
          <div className="footer-col">
            <h4 className="footer-title">About CityCare</h4>
            <ul className="footer-links">
              <li><Link to="/info/about-us">About Us</Link></li>
              <li><Link to="/info/structure">Structure & Key Personnel</Link></li>
              <li><Link to="/info/awards">Awards and Recognitions</Link></li>
              <li><Link to="/info/regulations">Regulations</Link></li>
              <li><Link to="/info/event-gallery">Event Gallery</Link></li>
              <li><Link to="/info/media">Media</Link></li>
              <li><Link to="/info/holidays">Holidays</Link></li>
              <li><Link to="/info/careers">Careers</Link></li>
              <li><Link to="/info/contact-us">Contact Us</Link></li>
              <li><Link to="/info/web-manager">Web Information Manager</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="footer-col">
            <h4 className="footer-title">City Departments</h4>
            <ul className="footer-links">
              <li><Link to="/info/default">Waste Management</Link></li>
              <li><Link to="/info/default">Water Supply Board</Link></li>
              <li><Link to="/info/default">Roads & Traffic Control</Link></li>
              <li><Link to="/info/default">Public Health Dept</Link></li>
              <li><Link to="/info/default">Electricity & Lighting</Link></li>
              <li><Link to="/info/default">Parks & Recreation</Link></li>
              <li><Link to="/info/default">Public Transport</Link></li>
              <li><Link to="/info/default">City Planning</Link></li>
              <li><Link to="/info/default">View all</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="footer-col">
            <h4 className="footer-title">Products & Services</h4>
            <ul className="footer-links">
              <li><Link to="/report">Report an Issue</Link></li>
              <li><Link to="/track">Track Complaint Status</Link></li>
              <li><Link to="/info/default">Emergency Contacts</Link></li>
              <li><Link to="/info/default">Pay Property Taxes</Link></li>
              <li><Link to="/info/default">Permits & Licenses</Link></li>
              <li><Link to="/info/default">Civic Guidelines</Link></li>
              <li><Link to="/info/default">Community Forums</Link></li>
              <li><Link to="/info/default">Public Issues</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="footer-col no-title-col">
            <ul className="footer-links font-bold-links">
              <li><Link to="/info/default">Disclaimer</Link></li>
              <li><Link to="/info/default">Privacy Policy</Link></li>
              <li><Link to="/info/default">Terms of Use</Link></li>
              <li><Link to="/info/default">Copyright</Link></li>
              <li><Link to="/info/default">Feedback</Link></li>
              <li><Link to="/info/default">Site Map</Link></li>
              <li><Link to="/info/default">Website Policies</Link></li>
              <li><Link to="/info/default">List of Empaneled Agencies</Link></li>
              <li><Link to="/info/default">Help</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
