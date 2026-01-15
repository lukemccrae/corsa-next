export interface SegmentEffort {
  segmentId: string;
  activityId: string;
  activityName: string;
  activityType: string;
  createdAt: string;
  distance: number;
  elapsedTime: number;
  movingTime: number;
  segmentCompletions: number;
  sportType: string;
  startDate: string;
  startDateLocal: string;
  userId: string;
}

export interface SegmentStats {
  totalCompletions: number;
  totalDistance: number;
  totalMovingTime: number;
  totalElapsedTime: number;
  averageCompletions: number;
  averageDistance: number;
  averageMovingTime: number;
  fastestTime: number;
  slowestTime: number;
  uniqueUsers: number;
  uniqueActivities: number;
}

export interface UserSegmentStats {
  userId: string;
  totalCompletions: number;
  totalDistance: number;
  totalMovingTime: number;
  totalElapsedTime: number;
  fastestTime: number;
  activities: number;
  efforts: SegmentEffort[];
}