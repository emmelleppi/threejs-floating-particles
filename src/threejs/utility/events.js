export const onDocumentMouseMove = (innerWidth, innerHeight) => (event) => {
  return {
    x: (event.clientX / innerWidth) * 2 - 1,
    y: -(event.clientY / innerHeight) * 2 + 1,
  }
}
