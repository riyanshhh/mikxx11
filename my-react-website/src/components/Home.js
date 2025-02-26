import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/Home.css';

function Home() {
  const [content, setContent] = useState({
    heroSection: {
      title: 'MIKXX MODELING AGENCY',
      subtitle: 'Discover the Next Face of Fashion',
      backgroundImage: ''
    },
    services: []
  });

  useEffect(() => {
    loadWebsiteContent();
  }, []);

  const loadWebsiteContent = async () => {
    try {
      const websiteDocRef = doc(db, 'website', 'content');
      const websiteDocSnap = await getDoc(websiteDocRef);
      
      if (websiteDocSnap.exists()) {
        setContent(websiteDocSnap.data());
      }
    } catch (error) {
      console.error('Error loading website content:', error);
    }
  };

  return (
    <div className="home">
      <section 
        className="hero-section" 
        style={{
          backgroundImage: content.heroSection.backgroundImage 
            ? `url(${content.heroSection.backgroundImage})`
            : 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://source.unsplash.com/1600x900/?fashion,model")'
        }}
      >
        <div className="hero-content">
          <h1>{content.heroSection.title}</h1>
          <p>{content.heroSection.subtitle}</p>
          <button className="cta-button">Become a Model</button>
        </div>
      </section>

      <section className="services-section">
        <h2>Our Services</h2>
        <div className="services-grid">
          {content.services.map((service, index) => (
            <div key={index} className="service-card">
              <i className={service.icon}></i>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home; 