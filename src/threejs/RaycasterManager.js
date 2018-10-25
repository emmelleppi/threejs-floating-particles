import * as THREE from "three"

const Raycaster = ({ mouse, camera, elements }) => {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera)
  return raycaster.intersectObjects(elements)
}

export default Raycaster