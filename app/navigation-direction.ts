let navigationDirection: 'left' | 'right' = 'right';

export const setNavigationDirection = (direction: 'left' | 'right') => {
  navigationDirection = direction;
};

export const getNavigationDirection = () => {
  return navigationDirection;
};