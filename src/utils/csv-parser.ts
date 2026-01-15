import type { SegmentEffort } from "../types/segment-effort";

export function parseSegmentEffortsCSV(csvText: string): SegmentEffort[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  return lines.slice(1).map(line => {
    // Handle CSV with quoted values
    const values:  string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.replace(/"/g, '') || '';
    });
    
    return {
      segmentId: row. SegmentId,
      activityId: row.ActivityId,
      activityName: row.ActivityName,
      activityType: row.ActivityType,
      createdAt: row.CreatedAt,
      distance: parseFloat(row.Distance),
      elapsedTime: parseInt(row.ElapsedTime),
      movingTime: parseInt(row.MovingTime),
      segmentCompletions: parseInt(row.SegmentCompletions),
      sportType: row.SportType,
      startDate: row.StartDate,
      startDateLocal: row.StartDateLocal,
      userId: row.UserId,
    };
  });
}