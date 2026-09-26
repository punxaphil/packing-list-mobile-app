const LAYOUT_DURATION = 300;

let animating = false;
let layoutTimeout: ReturnType<typeof setTimeout>;

export const isAnimatingLayout = () => animating;

export const animateLayout = () => {
  animating = true;
  clearTimeout(layoutTimeout);
  layoutTimeout = setTimeout(() => {
    animating = false;
  }, LAYOUT_DURATION);
};
