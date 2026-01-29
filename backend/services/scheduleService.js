const schedule = require("node-schedule");

// Store scheduled jobs
const scheduledJobs = {};

// Schedule a lottery draw at specific time
exports.scheduleDrawLottery = (scheduleId, scheduledTime, drawFunction) => {
  // Cancel existing job if exists
  if (scheduledJobs[scheduleId]) {
    scheduledJobs[scheduleId].cancel();
  }

  // Schedule new job
  const job = schedule.scheduleJob(scheduleId, scheduledTime, drawFunction);
  scheduledJobs[scheduleId] = job;

  console.log(`📅 Lottery draw scheduled for ${scheduleId} at ${scheduledTime}`);
  return job;
};

// Cancel scheduled draw
exports.cancelScheduledDraw = (scheduleId) => {
  if (scheduledJobs[scheduleId]) {
    scheduledJobs[scheduleId].cancel();
    delete scheduledJobs[scheduleId];
    console.log(`❌ Scheduled draw ${scheduleId} cancelled`);
    return true;
  }
  return false;
};

// Get all scheduled jobs
exports.getScheduledJobs = () => {
  return Object.keys(scheduledJobs).map((key) => ({
    id: key,
    nextInvocation: scheduledJobs[key].nextInvocation(),
  }));
};

// Get next invocation time of a scheduled job
exports.getNextInvocationTime = (scheduleId) => {
  if (scheduledJobs[scheduleId]) {
    return scheduledJobs[scheduleId].nextInvocation();
  }
  return null;
};
