export const diveLogs = [
  {
    id: '1',
    date: '2023-10-26',
    location: 'Great Barrier Reef, Australia',
    depthMeters: 25,
    durationMinutes: 45,
    temperatureC: 26,
    conditions: ['Calm', 'Excellent Visibility'],
    image:
      'https://images.unsplash.com/photo-1505764706515-aa95265c5abc?q=80&w=1200&auto=format&fit=crop',
    notes:
      'Saw schools of parrotfish and a sea turtle near the bommie. Very relaxed dive with mild current.',
    confirmedBy: 'Alex Morgan, Dive Master',
    signatureImage:
      'https://dummyimage.com/200x60/ffffff/000000.png&text=Signature'
  },
  {
    id: '2',
    date: '2023-10-20',
    location: 'Tulamben, Bali, Indonesia',
    depthMeters: 30,
    durationMinutes: 55,
    temperatureC: 28,
    conditions: ['Mild Current', 'USAT Liberty Wreck'],
    image:
      'https://images.unsplash.com/photo-1544551763-7ef4206b37f2?q=80&w=1200&auto=format&fit=crop',
    notes:
      'Explored the Liberty Wreck. Barracudas spotted near the bow, visibility ~20m.',
    confirmedBy: 'Maya Chen, Instructor',
    signatureImage:
      'https://dummyimage.com/200x60/ffffff/000000.png&text=Signature'
  },
  {
    id: '3',
    date: '2023-10-15',
    location: 'Cozumel, Mexico',
    depthMeters: 18,
    durationMinutes: 50,
    temperatureC: 29,
    conditions: ['Strong Current', 'Drift Dive'],
    image:
      'https://images.unsplash.com/photo-1513191344327-9fbd2b914bf9?q=80&w=1200&auto=format&fit=crop',
    notes:
      'Classic Cozumel drift along the wall. Eagle ray sighting at 18m.',
    confirmedBy: 'Diego Alvarez, Dive Master',
    signatureImage:
      'https://dummyimage.com/200x60/ffffff/000000.png&text=Signature'
  },
  {
    id: '4',
    date: '2023-10-10',
    location: 'Red Sea, Egypt',
    depthMeters: 22,
    durationMinutes: 60,
    temperatureC: 27,
    conditions: ['Light Chop', 'Healthy Coral'],
    image:
      'https://images.unsplash.com/photo-1518933165971-611dbc9c412d?q=80&w=1200&auto=format&fit=crop',
    notes:
      'Multi-level profile with vibrant coral gardens. Plenty of anthias.',
    confirmedBy: 'Sara Ibrahim, Instructor',
    signatureImage:
      'https://dummyimage.com/200x60/ffffff/000000.png&text=Signature'
  }
];

export function getDiveById(id) {
  return diveLogs.find((d) => d.id === id);
}
