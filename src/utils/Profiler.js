import { Profiler } from 'react';

/**
 * Performance monitoring callback for React Profiler
 * Logs component render performance metrics
 */
export const onRenderCallback = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`⚡ Profiler: ${id}`);
    console.log(`Phase: ${phase}`);
    console.log(`Actual Duration: ${actualDuration.toFixed(2)}ms`);
    console.log(`Base Duration: ${baseDuration.toFixed(2)}ms`);
    console.log(`Start Time: ${startTime.toFixed(2)}ms`);
    console.log(`Commit Time: ${commitTime.toFixed(2)}ms`);
    
    // Warn if render is slow
    if (actualDuration > 16) {
      console.warn(`⚠️ Slow render detected! Consider optimization.`);
    }
    console.groupEnd();
  }
  
  // In production, send to analytics service
  if (process.env.NODE_ENV === 'production' && actualDuration > 50) {
    // Log slow renders to monitoring service
    if (window.analytics) {
      window.analytics.track('slow_render', {
        component: id,
        duration: actualDuration,
        phase
      });
    }
  }
};

/**
 * HOC to wrap components with React Profiler
 */
export const withProfiler = (Component, id) => {
  return (props) => (
    <Profiler id={id || Component.name} onRender={onRenderCallback}>
      <Component {...props} />
    </Profiler>
  );
};

export default Profiler;
