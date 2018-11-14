export const moveObjects = (array = [], zFlat = false) => {
  for (let i = 0; i < array.length; i++) {
    const object = array[i]
    const reflectionVector = checkCollision(object.position, zFlat)
    if (reflectionVector) {
      object.vertices.reflect(reflectionVector)
    }
    const { x, y, z } = object.vertices
    object.position.x += x
    object.position.y += y
    object.position.z += z
  }
}