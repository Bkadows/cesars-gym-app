const heatmapTargets = {
  1: { 8: 17, 9: 3, 10: 5, 11: 4, 12: 13, 13: 8, 14: 8, 15: 9, 16: 2, 17: 9, 18: 12, 19: 14, 20: 6, 21: 3 },
  2: { 10: 1, 13: 49, 14: 89, 15: 12, 16: 12, 17: 23, 18: 32, 19: 11, 20: 1 },
  3: { 12: 21, 14: 8, 15: 3, 16: 10, 17: 17, 18: 36, 19: 70, 20: 7 },
  4: { 12: 23, 13: 22, 14: 1, 15: 23, 16: 17, 17: 24, 18: 27, 19: 10, 20: 2 },
  5: { 8: 10, 9: 4, 10: 3, 12: 2, 13: 3, 14: 9, 15: 28, 16: 4, 17: 15, 18: 6, 19: 19, 20: 4 },
  6: { 14: 3, 15: 43, 16: 10, 17: 11, 18: 16, 19: 16, 20: 3 }
};

const dateToDOW = {
  '2026-06-01': 1, '2026-06-02': 2, '2026-06-03': 3, '2026-06-04': 4, '2026-06-05': 5, '2026-06-06': 6,
  '2026-06-08': 1, '2026-06-09': 2, '2026-06-10': 3, '2026-06-11': 4, '2026-06-12': 5, '2026-06-13': 6,
  '2026-06-15': 1, '2026-06-16': 2, '2026-06-17': 3, '2026-06-18': 4
};

const todayD = '2026-06-19';

// Today's 21 entrances by hour
const todayCheckinsByHour = {
  8: 9, 9: 4, 10: 3, 11: 0, 12: 2, 13: 3
};

const dailyCheckinCounts = {};
Object.keys(dateToDOW).forEach(d => dailyCheckinCounts[d] = 0);

// Distribute heatmap targets
for (let dow = 1; dow <= 6; dow++) {
  const hoursData = heatmapTargets[dow];
  const dates = Object.entries(dateToDOW).filter(([d, dw]) => dw === dow).map(([d, dw]) => d);
  
  Object.entries(hoursData).forEach(([hour, total]) => {
    let rem = total;
    if (dow === 5) {
      // Subtract today's check-ins from Friday
      const todayCount = todayCheckinsByHour[hour] || 0;
      rem = Math.max(0, total - todayCount);
    }
    
    // Split rem across the dates
    const n = dates.length;
    const base = Math.floor(rem / n);
    const extra = rem % n;
    
    dates.forEach((d, idx) => {
      const count = base + (idx < extra ? 1 : 0);
      dailyCheckinCounts[d] += count;
    });
  });
}

console.log('Daily Checkin Counts (C_day):');
Object.entries(dailyCheckinCounts).sort().forEach(([d, count]) => {
  console.log(`  ${d} (${dateToDOW[d]}): ${count} checkins`);
});

const totalCheckins = Object.values(dailyCheckinCounts).reduce((a, b) => a + b, 0);
console.log('Total historical checkins:', totalCheckins);
