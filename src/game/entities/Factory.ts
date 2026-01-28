import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export class Factory {
  public mesh: THREE.Group

  constructor(scene: THREE.Scene, world: CANNON.World) {
    this.mesh = new THREE.Group()

    // Create factory building with better materials
    const buildingGeometry = new THREE.BoxGeometry(60, 20, 40)
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      metalness: 0.4,
      roughness: 0.6,
      emissive: 0x0a0a0a
    })
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial)
    building.position.y = 10
    building.castShadow = true
    building.receiveShadow = true
    this.mesh.add(building)

    // Create building physics
    const shape = new CANNON.Box(new CANNON.Vec3(30, 10, 20))
    const body = new CANNON.Body({ mass: 0, shape })
    body.position.set(0, 10, 0)
    world.addBody(body)

    // Create floor with better detail
    const floorGeometry = new THREE.PlaneGeometry(200, 200)
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.2,
      roughness: 0.8,
      emissive: 0x050505
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    floor.position.y = -0.01
    this.mesh.add(floor)

    // Create floor physics
    const floorShape = new CANNON.Plane()
    const floorBody = new CANNON.Body({ mass: 0, shape: floorShape })
    floorBody.position.y = 0
    world.addBody(floorBody)

    // Add some industrial structures
    this.addPipes()
    this.addMachinery()
    this.addWalls()
    this.addDecor()

    // If an external factory map exists, replace procedural factory with it
    this.loadFactoryModel(scene, world)
  }

  private addPipes(): void {
    const pipePositions = [
      [15, 8, 0],
      [-15, 8, 0],
      [0, 8, 15],
      [0, 8, -15],
      [25, 12, 10],
      [-25, 12, -10]
    ]

    pipePositions.forEach((pos) => {
      const pipeGeometry = new THREE.CylinderGeometry(0.3, 0.3, 20, 12)
      const pipeMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        metalness: 0.7,
        roughness: 0.3,
        emissive: 0x1a1a1a
      })
      const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial)
      pipe.position.set(pos[0], pos[1], pos[2])
      pipe.castShadow = true
      pipe.receiveShadow = true
      this.mesh.add(pipe)
    })
  }

  private addMachinery(): void {
    // Create various machinery boxes with more detail
    const machineryPositions = [
      [20, 2, 10],
      [-20, 2, 10],
      [20, 2, -10],
      [-20, 2, -10],
      [0, 2, 15],
      [10, 2, -20]
    ]

    machineryPositions.forEach((pos) => {
      const machGeometry = new THREE.BoxGeometry(4, 4, 4)
      const machMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        metalness: 0.6,
        roughness: 0.4,
        emissive: 0x1a1a1a
      })
      const machine = new THREE.Mesh(machGeometry, machMaterial)
      machine.position.set(pos[0], pos[1], pos[2])
      machine.castShadow = true
      machine.receiveShadow = true
      this.mesh.add(machine)

      // Add some details to machinery
      const detailGeometry = new THREE.SphereGeometry(0.3, 8, 8)
      const detailMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.8,
        roughness: 0.2
      })
      for (let i = 0; i < 3; i++) {
        const detail = new THREE.Mesh(detailGeometry, detailMaterial)
        detail.position.set(pos[0] + Math.random() * 2 - 1, pos[1] + 2 + i, pos[2] + Math.random() * 2 - 1)
        this.mesh.add(detail)
      }
    })
  }

  private addWalls(): void {
    // Create walls with more industrial look
    const wallPositions = [
      { pos: [30, 10, 0], rot: [0, 0, 0], scale: [1, 20, 40] },
      { pos: [-30, 10, 0], rot: [0, 0, 0], scale: [1, 20, 40] },
      { pos: [0, 10, 20], rot: [0, 0, 0], scale: [60, 20, 1] },
      { pos: [0, 10, -20], rot: [0, 0, 0], scale: [60, 20, 1] }
    ]

    wallPositions.forEach((wall) => {
      const wallGeometry = new THREE.BoxGeometry(1, 1, 1)
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.1,
        roughness: 0.95,
        emissive: 0x030303
      })
      const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial)
      wallMesh.position.set(wall.pos[0], wall.pos[1], wall.pos[2])
      wallMesh.scale.set(wall.scale[0], wall.scale[1], wall.scale[2])
      wallMesh.castShadow = true
      wallMesh.receiveShadow = true
      this.mesh.add(wallMesh)
    })
  }

  private addDecor(): void {
    // Add some atmospheric details like small boxes and debris
    const decorPositions = [
      [5, 0.5, 5],
      [-10, 0.5, 8],
      [15, 0.5, -5],
      [-5, 0.5, -15],
      [25, 0.5, 5]
    ]

    decorPositions.forEach((pos) => {
      const decorGeometry = new THREE.BoxGeometry(1.5, 1, 1.5)
      const decorMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        metalness: 0.3,
        roughness: 0.7
      })
      const decor = new THREE.Mesh(decorGeometry, decorMaterial)
      decor.position.set(pos[0], pos[1], pos[2])
      decor.castShadow = true
      decor.receiveShadow = true
      this.mesh.add(decor)
    })
  }

  private loadFactoryModel(scene: THREE.Scene, world: CANNON.World): void {
    const loader = new GLTFLoader()
    const path = 'models/factory/abandoned-factory.glb'
    loader.load(path, (gltf) => {
      // Replace procedural geometry with the loaded model
      this.mesh.clear()
      const model = gltf.scene
      model.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) {
          const mesh = node as THREE.Mesh
          mesh.castShadow = true
          mesh.receiveShadow = true
        }
      })
      this.mesh.add(model)

      // Add simple static colliders approximated by mesh bounding boxes
      model.updateMatrixWorld(true)
      model.traverse((node) => {
        if ((node as THREE.Mesh).isMesh && node.geometry) {
          const mesh = node as THREE.Mesh
          mesh.geometry.computeBoundingBox()
          const bbox = mesh.geometry.boundingBox!
          const size = new THREE.Vector3()
          bbox.getSize(size)

          // account for world scale
          const worldScale = new THREE.Vector3()
          mesh.getWorldScale(worldScale)
          size.multiply(worldScale)

          if (size.x <= 0 || size.y <= 0 || size.z <= 0) return

          const halfExtents = new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)
          const box = new CANNON.Box(halfExtents)

          const pos = new THREE.Vector3()
          mesh.getWorldPosition(pos)

          const body = new CANNON.Body({ mass: 0 })
          body.addShape(box)
          body.position.set(pos.x, pos.y, pos.z)
          world.addBody(body)
        }
      })
    }, undefined, (err) => {
      console.error('Error loading factory model:', err)
    })
  }
}
