export const checkCollision = (coords = { x:0, y:0, z:0 }, cubeDimensions = { x:0, y:0, z:0 }, zFlat = false, zBias = 0) => {
  const { x, y, z } = coords
  const { xCube, yCube, zCube } = cubeDimensions
  const prospectiveScaling = zFlat ? z / 300 : 1 / 2
  
  if (Math.abs(x) > xCube * prospectiveScaling) {
    return x > 0 ? new THREE.Vector3(-1, 0, 0) : new THREE.Vector3(1, 0, 0)
  }
  if (Math.abs(y) > yCube * prospectiveScaling) {
    return y > 0 ? new THREE.Vector3(0, -1, 0) : new THREE.Vector3(0, 1, 0)
  }
  if (!zFlat) {
    if (z - zBias > zCube / 2) {
      return new THREE.Vector3(0, 0, -1)
    }
    if (z - zBias <= 0) {
      return new THREE.Vector3(0, 0, 1)
    }
  }
  return null
}

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