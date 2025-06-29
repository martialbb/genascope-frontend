import React, { useState } from 'react';

const SimpleTestNavigation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue', border: '3px solid red' }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>SIMPLE TEST NAVIGATION</h1>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'yellow' }}>
        <button 
          onClick={() => setActiveTab('dashboard')}
          style={{ 
            margin: '10px', 
            padding: '10px 20px', 
            backgroundColor: activeTab === 'dashboard' ? 'green' : 'white',
            color: activeTab === 'dashboard' ? 'white' : 'black',
            border: '2px solid black',
            fontSize: '16px'
          }}
        >
          Dashboard Tab
        </button>
        
        <button 
          onClick={() => setActiveTab('wizard')}
          style={{ 
            margin: '10px', 
            padding: '10px 20px', 
            backgroundColor: activeTab === 'wizard' ? 'green' : 'white',
            color: activeTab === 'wizard' ? 'white' : 'black',
            border: '2px solid black',
            fontSize: '16px'
          }}
        >
          Configuration Wizard Tab
        </button>
        
        <button 
          onClick={() => setActiveTab('analytics')}
          style={{ 
            margin: '10px', 
            padding: '10px 20px', 
            backgroundColor: activeTab === 'analytics' ? 'green' : 'white',
            color: activeTab === 'analytics' ? 'white' : 'black',
            border: '2px solid black',
            fontSize: '16px'
          }}
        >
          Analytics Tab
        </button>
      </div>
      
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'lightgreen' }}>
        <h2>Active Tab: {activeTab}</h2>
        {activeTab === 'dashboard' && <p>Dashboard content goes here...</p>}
        {activeTab === 'wizard' && <p>Configuration Wizard content goes here...</p>}
        {activeTab === 'analytics' && <p>Analytics content goes here...</p>}
      </div>
    </div>
  );
};

export default SimpleTestNavigation;
