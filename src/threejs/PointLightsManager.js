import { useState, useEffect } from 'react'

import PointLight from "./PointLight";

const PointLightsManager = props  => {
  const {
    colors,
    intensity,
    radius,
    zFlat,
    scene,
    addInUpdateProcess,
    fakeCamera,
  } = props
  
  const [ lights, setLights ] = useState([])
  useEffect(() => {
    const lightsArray = colors.map(color => new PointLight({
      zFlat,
      radius,
      intensity,
      color: color,
      fakeCamera,  
    }))
    lightsArray.forEach(light => scene.add(light.pointLight))
    setLights(lightsArray)
    
    return () => {
      // Clean up TODO
    }
  },[])

  addInUpdateProcess({
    fn: () => update(lights),
    id: 'point-lights-update',
  })

  return null
}

const update = lights => {    
  for(let i = 0; i < lights.length; i++ ){
    lights[i].update()
  }
}

export default PointLightsManager