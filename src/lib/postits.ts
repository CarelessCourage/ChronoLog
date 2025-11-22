// Random post-it note messages
const POST_IT_MESSAGES = [
  "📅 Team meeting @ 3PM\nDon't forget!",
  'Old password:\nWinter2023!',
  '🔑 Backup codes:\n1234-5678-9012',
  'Remember:\nVPN required',
  '☕ Coffee with Sarah\nTomorrow 10AM',
  "🎂 Bob's birthday\nFriday!",
  'Wi-Fi password:\nOffice2023_Secure',
  '📞 Call IT support\nExt: 4567',
  '💡 Project deadline\nNext Monday',
  '🍕 Pizza party\nBreak room 12:30',
  'Remember to:\n- Update timesheet\n- Submit report',
  'Parking spot:\nLevel 2, B-47',
  'Gym membership:\n#8472910',
  '🏠 WFH days:\nTue & Thu',
  'Printer code:\n*2580#',
];

const COLORS = [
  '#fef08a', // yellow
  '#fed7aa', // orange
  '#fecaca', // red
  '#bfdbfe', // blue
  '#d9f99d', // lime
  '#fbcfe8', // pink
];

export function getRandomPostItMessage(): string {
  return POST_IT_MESSAGES[Math.floor(Math.random() * POST_IT_MESSAGES.length)];
}

export function getRandomPostItColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function getRandomPosition(): { x: number; y: number } {
  // Get viewport dimensions
  const maxX = window.innerWidth - 250; // Account for post-it width (192px + padding)
  const maxY = window.innerHeight - 200; // Account for post-it height

  // Random position with some margin from edges
  const x = Math.floor(Math.random() * (maxX - 100)) + 50;
  const y = Math.floor(Math.random() * (maxY - 100)) + 50;

  return { x, y };
}
