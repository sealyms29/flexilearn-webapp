// Seed script for database
(async () => {
  try {
    console.log('Starting seed...');
    const response = await fetch('http://localhost:8800/api/gigs/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    console.log('✓ Seeded successfully:', JSON.stringify(data));
  } catch (err) {
    console.error('✗ Seed failed:', err.message);
  }
})();
