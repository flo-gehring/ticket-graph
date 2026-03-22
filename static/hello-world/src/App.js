import React, { useState, useEffect } from 'react';
import { requestJira } from '@forge/bridge';
import '@atlaskit/css-reset';

const App = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Q1");
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dashboard usage data for different periods
  const q1Data = [
    { month: 'Jan', usage: 45 },
    { month: 'Feb', usage: 52 },
    { month: 'Mar', usage: 48 },
  ];

  const q2Data = [
    { month: 'Apr', usage: 61 },
    { month: 'May', usage: 55 },
    { month: 'Jun', usage: 67 },
  ];

  const chartData = selectedPeriod === "Q1" ? q1Data : q2Data;
  const maxUsage = Math.max(...chartData.map(item => item.usage), 1);

  // Fetch current user information from Jira API
  const fetchUserInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await requestJira(`/rest/api/3/users/search`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      setUserInfo(data[0]);
    } catch (err) {
      setError(`Failed to fetch user info: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const chartStyle = {
    maxWidth: '600px',
    marginTop: '24px',
  };

  const barContainerStyle = {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '24px',
    height: '200px',
    padding: '16px 16px 40px 16px', // Top, right, bottom (extra for labels), left
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f5f5f5',
    boxSizing: 'border-box',
  };

  const barStyle = (value) => {
    const availableHeight = 200 - 32; // Container height minus padding
    const barHeight = (value / maxUsage) * availableHeight;
    return {
      width: '60px', // Fixed width for bars
      height: `${barHeight}px`,
      backgroundColor: '#0052CC',
      borderRadius: '4px 4px 0 0',
      minHeight: '20px',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingBottom: '8px',
      color: 'white',
      fontWeight: 'bold',
    };
  };

  const buttonStyle = (isSelected) => ({
    padding: '8px 16px',
    marginRight: '8px',
    backgroundColor: isSelected ? '#0052CC' : 'transparent',
    color: isSelected ? 'white' : 'inherit',
    border: '1px solid #0052CC',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '14px',
  });

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          Dashboard
        </h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>Monthly usage overview</p>

        <div>
          <button
            style={buttonStyle(selectedPeriod === "Q1")}
            onClick={() => setSelectedPeriod("Q1")}
          >
            Q1
          </button>
          <button
            style={buttonStyle(selectedPeriod === "Q2")}
            onClick={() => setSelectedPeriod("Q2")}
          >
            Q2
          </button>
        </div>
      </div>

      <div style={chartStyle}>
        <div style={barContainerStyle}>
          {chartData.map((item, index) => {
            const availableHeight = 200 - 16 - 40; // Container height minus top padding minus bottom padding (which includes label space)
            const barHeight = (item.usage / maxUsage) * availableHeight;
            return (
              <div key={index} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'flex-end',
                width: '60px', // Fixed width for bars
                flexShrink: 0, // Prevent bars from shrinking
                height: '100%',
              }}>
                <div style={{
                  width: '100%',
                  height: `${barHeight}px`,
                  backgroundColor: '#0052CC',
                  borderRadius: '4px 4px 0 0',
                  minHeight: '20px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: '8px',
                  color: 'white',
                  fontWeight: 'bold',
                }}>
                  {item.usage}
                </div>
                <div style={{ marginTop: '8px', fontSize: '14px', height: '24px' }}>{item.month}</div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '16px', padding: '16px' }}>
          <p style={{ marginBottom: '8px' }}>Current period: {selectedPeriod}</p>
          <p>Total usage: {chartData.reduce((sum, item) => sum + item.usage, 0)}</p>
        </div>
      </div>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          Current User Information
        </h2>
        {loading && <p>Loading user info...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && userInfo && (
          <div style={{
            padding: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#fff',
          }}>
            <p style={{ marginBottom: '8px' }}>
              <strong>Display name for first user:</strong> {userInfo.displayName}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;