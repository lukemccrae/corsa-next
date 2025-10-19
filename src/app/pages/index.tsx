import React from 'react';
import dynamic from 'next/dynamic';
import MapFrontPage from '../../components/MapFrontPage';

// This is your front page: renders the PrimeReact map with icons
export default function Home() {
  return (
      <MapFrontPage />
  );
}