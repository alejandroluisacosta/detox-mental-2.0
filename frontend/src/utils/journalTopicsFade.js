const TOPICS_FADE_TOLERANCE_PX = 1;

/** Decide which topic-row edges should fade based on horizontal scroll overflow. */
export const getTopicsFadeEdges = ({ scrollLeft, clientWidth, scrollWidth }) => ({
  left: scrollLeft > TOPICS_FADE_TOLERANCE_PX,
  right: scrollLeft + clientWidth < scrollWidth - TOPICS_FADE_TOLERANCE_PX,
});
