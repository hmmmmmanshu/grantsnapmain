import { useState, useEffect } from 'react';

interface LocationData {
  country: string;
  currency: string;
  symbol: string;
  loading: boolean;
  error: string | null;
}

export const useLocation = () => {
  const [locationData, setLocationData] = useState<LocationData>({
    country: 'US',
    currency: 'USD',
    symbol: '$',
    loading: true,
    error: null
  });

  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Try to get location from IP geolocation
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.country_code) {
          const country = data.country_code;
          let currency = 'USD';
          let symbol = '$';
          
          // Map countries to currencies
          switch (country) {
            case 'IN':
              currency = 'INR';
              symbol = '₹';
              break;
            case 'US':
              currency = 'USD';
              symbol = '$';
              break;
            case 'GB':
              currency = 'GBP';
              symbol = '£';
              break;
            case 'EU':
            case 'DE':
            case 'FR':
            case 'IT':
            case 'ES':
              currency = 'EUR';
              symbol = '€';
              break;
            case 'CA':
              currency = 'CAD';
              symbol = 'C$';
              break;
            case 'AU':
              currency = 'AUD';
              symbol = 'A$';
              break;
            default:
              currency = 'USD';
              symbol = '$';
          }
          
          setLocationData({
            country,
            currency,
            symbol,
            loading: false,
            error: null
          });
        } else {
          throw new Error('Unable to detect location');
        }
      } catch (error) {
        console.error('Location detection failed:', error);
        // Fallback to US defaults
        setLocationData({
          country: 'US',
          currency: 'USD',
          symbol: '$',
          loading: false,
          error: 'Location detection failed, using default currency'
        });
      }
    };

    detectLocation();
  }, []);

  return locationData;
};
