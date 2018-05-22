//ractive event polyfill for older browser eg. safari 6.0.1
export function targetNotContained(ele) {
  let event = ele.event.original,
    node = ele.event.node;
  return !node.contains(event.relatedTarget);
}
