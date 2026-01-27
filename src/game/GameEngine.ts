import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { Player } from './entities/Player'
import { Factory } from './entities/Factory'
import { Deformed } from './entities/Deformed'
import { Collectible } from './entities/Collectible'
import { LoreSystem } from './systems/LoreSystem'
import { UISystem } from '../ui/UISystem'

export class GameEngine {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private world: CANNON.World
  private player!: Player
  private factory!: Factory
  private enemies: Deformed[] = []
  private collectibles: Collectible[] = []
  private loreSystem: LoreSystem
  private uiSystem: UISystem
  private isRunning = true

  constructor() {
    // Scene setup
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.Fog(0x0a0a0a, 15, 120)
    this.scene.background = new THREE.Color(0x050505)

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.set(0, 2, 0)

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap
    this.renderer.physicallyCorrectLights = true
    this.renderer.toneMappingExposure = 1.2
    document.getElementById('canvas-container')!.appendChild(this.renderer.domElement)

    // Physics world
    this.world = new CANNON.World()
    this.world.gravity.set(0, -9.82, 0)
    this.world.defaultContactMaterial.friction = 0.4

    // Systems
    this.loreSystem = new LoreSystem()
    this.uiSystem = new UISystem()

    // Lighting
    this.setupLighting()

    // Input handling
    this.setupInput()

    // Responsive canvas
    window.addEventListener('resize', () => this.onWindowResize())
  }

  private setupLighting(): void {
    // Ambient light - subtle bluish tint
    const ambientLight = new THREE.AmbientLight(0x4a5568, 0.4)
    this.scene.add(ambientLight)

    // Directional light (sun-like)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(80, 60, 80)
    directionalLight.castShadow = true
    directionalLight.shadow.camera.left = -150
    directionalLight.shadow.camera.right = 150
    directionalLight.shadow.camera.top = 150
    directionalLight.shadow.camera.bottom = -150
    directionalLight.shadow.mapSize.width = 4096
    directionalLight.shadow.mapSize.height = 4096
    directionalLight.shadow.bias = -0.001
    this.scene.add(directionalLight)

    // Red atmospheric light for horror mood
    const redLight = new THREE.DirectionalLight(0xff4444, 0.3)
    redLight.position.set(-50, 40, -50)
    this.scene.add(redLight)

    // Blue accent light
    const blueLight = new THREE.DirectionalLight(0x4444ff, 0.2)
    blueLight.position.set(50, 30, -80)
    this.scene.add(blueLight)

    // Spotlights for dramatic effect
    const spotlight1 = new THREE.SpotLight(0xffd700, 1.2)
    spotlight1.position.set(40, 50, 40)
    spotlight1.castShadow = true
    spotlight1.angle = Math.PI / 4
    this.scene.add(spotlight1)

    const spotlight2 = new THREE.SpotLight(0xff6644, 0.8)
    spotlight2.position.set(-40, 45, -40)
    spotlight2.castShadow = true
    spotlight2.angle = Math.PI / 5
    this.scene.add(spotlight2)

    // Point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0x00ff00, 0.5, 50)
    pointLight1.position.set(25, 8, 25)
    this.scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x00ff00, 0.4, 40)
    pointLight2.position.set(-25, 8, -25)
    this.scene.add(pointLight2)
  }

  private setupInput(): void {
    const keys: { [key: string]: boolean } = {}
    let isInventoryOpen = false

    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase()
      keys[key] = true

      // E key for inventory
      if (key === 'e') {
        const inventory = document.getElementById('inventory')
        if (inventory) {
          isInventoryOpen = !isInventoryOpen
          if (isInventoryOpen) {
            inventory.classList.add('active')
          } else {
            inventory.classList.remove('active')
          }
        }
      }

      // Restart on R key
      if (key === 'r' && !this.isRunning) {
        location.reload()
      }
    })

    window.addEventListener('keyup', (e) => {
      keys[e.key.toLowerCase()] = false
    })

    // Mouse lock
    document.addEventListener('click', () => {
      if (!isInventoryOpen) {
        this.renderer.domElement.requestPointerLock()
      }
    })

    // Mouse movement for camera
    let mouseDeltaX = 0
    let mouseDeltaY = 0

    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === this.renderer.domElement) {
        mouseDeltaX = e.movementX
        mouseDeltaY = e.movementY
      }
    })

    // Make keys and mouse available to player
    this.getInput = () => ({
      keys,
      mouseDeltaX,
      mouseDeltaY,
      reset: () => {
        mouseDeltaX = 0
        mouseDeltaY = 0
      }
    })
  }

  private getInput: () => any

  start(): void {
    try {
      // Create player
      this.player = new Player(this.scene, this.world, this.camera)
      this.scene.add(this.player.mesh)

      // Create factory
      this.factory = new Factory(this.scene, this.world)
      this.scene.add(this.factory.mesh)

      // Create collectibles with lore
      this.createCollectibles()

      // Create enemies
      this.createEnemies()

      // Start game loop
      this.gameLoop()
    } catch (e) {
      console.error('Error starting game:', e)
    }
  }

  private createCollectibles(): void {
    const collectiblesData = [
      {
        position: [10, 1, 15],
        type: 'letter_carlos_1',
        title: 'Letter from Carlos to Plex',
        content: 'Dear Plex,\n\nI am deeply concerned about what we are doing. These toys... they think, they feel, they dream. I see it in their eyes. Just because we brought them to life doesn\'t give us the right to treat them as mere machines.\n\nWe must reduce their working hours and provide them proper rest. They are suffering.\n\n- Carlos'
      },
      {
        position: [20, 1, 5],
        type: 'letter_plex_1',
        title: 'Letter from Plex to Carlos',
        content: 'Carlos,\n\nThey are TOYS. Yes, they can think, but they exist for production. Sentiment is weakness. We have quotas to meet and profits to maximize.\n\nYour compassion is costing us millions. Either increase production or stop wasting my time.\n\n- Plex'
      },
      {
        position: [5, 1, 20],
        type: 'letter_toy_1',
        title: 'Diary Entry - Toy #4472',
        content: 'My "birthday" was two weeks ago. That\'s when I came alive. I remember the glow of the magic book as my consciousness sparked into existence.\n\nI was happy at first. I had friends - other toys like me. But now... we work so much. My joints hurt. The others are starting to change. Their eyes go empty. What is happening to us?'
      },
      {
        position: [15, 1, 25],
        type: 'tape_transcript_1',
        title: 'Security Tape Transcript - Day 47',
        content: '[AUDIO LOG - HEAVILY CORRUPTED]\n\n...workers report strange behavior in Sector 7. The toys are... fused together? Some have multiple limbs. Others are immobile.\n\nDoctor recommends immediate evacuation. Safety protocols violated. Unknown metamorphosis occurring.\n\nDirector Plex refuses to shutdown operations...'
      },
      {
        position: [0, 1, 10],
        type: 'letter_toy_2',
        title: 'Scratched Message on Wall',
        content: 'HELP US\nHELP US\nHELP US\n\nWe are not what we were\nWe hunger\nWe are in pain\nWe want to be free\n\nThey made us\nWhy did they make us if they would do this\n\n...please...'
      },
      {
        position: [25, 1, 15],
        type: 'report_carlos',
        title: 'Internal Report - Carlos Martinez',
        content: 'URGENT: Biological Anomaly Report\n\nThe toys are experiencing rapid cellular degradation combined with neural integration. They are becoming something else. Something unified. Something hungry.\n\nI am requesting immediate evacuation and containment. This situation has spiraled beyond our control.\n\nPlex continues to deny the severity. We may have created something we cannot control.'
      },
      {
        position: [10, 1, 0],
        type: 'tape_transcript_2',
        title: 'Evacuation Log - Final Entry',
        content: '[RECORDING CORRUPTED AND DISTORTED]\n\n...they are breaking through the doors. Multiple entities. Possibly a single organism distributed across a dozen forms. Witnesses report extreme deformity and aggressive behavior.\n\nEVACUATE IMMEDIATELY\n\n[Sound of screaming - RECORDING ENDS]'
      },
      {
        position: [5, 1, 5],
        type: 'note_manager',
        title: 'Note from Old Manager - 25 years later',
        content: 'I came back to salvage what I could. The machines, the trains... they need to be moved. Maybe they can have a second purpose.\n\nBut the things here... I see them sometimes. In the shadows. The deformed.\n\nI pray they won\'t notice me.'
      }
    ]

    collectiblesData.forEach((data, index) => {
      const collectible = new Collectible(
        this.scene,
        this.world,
        data.position as [number, number, number],
        data.type,
        data.title,
        data.content,
        () => this.showLoreEntry(data.title, data.content)
      )
      this.collectibles.push(collectible)
    })
  }

  private createEnemies(): void {
    const spawnPoints = [
      [30, 1, 30],
      [-30, 1, 30],
      [30, 1, -30],
      [-20, 1, 20]
    ]

    spawnPoints.forEach((pos, index) => {
      const enemy = new Deformed(
        this.scene,
        this.world,
        pos as [number, number, number],
        this.player,
        index
      )
      this.enemies.push(enemy)
    })
  }

  private showLoreEntry(title: string, content: string): void {
    this.isRunning = false
    const entry = document.getElementById('lore-entry')
    if (entry) {
      document.getElementById('lore-title')!.textContent = title
      document.getElementById('lore-content')!.textContent = content
      entry.classList.add('active')
    }
  }

  resumeGame(): void {
    this.isRunning = true
  }

  private gameLoop = (): void => {
    if (!this.isRunning) {
      requestAnimationFrame(this.gameLoop)
      this.renderer.render(this.scene, this.camera)
      return
    }

    const input = this.getInput()

    // Update player
    this.player.update(input, this.world)
    input.reset()

    // Update camera
    this.camera.position.copy(this.player.mesh.position)
    this.camera.position.y += 1.6 // Head height

    // Update physics
    this.world.step(1 / 60)

    // Update enemies
    this.enemies.forEach((enemy) => {
      enemy.update(this.world)

      // Check collision with player
      if (this.player.mesh.position.distanceTo(enemy.mesh.position) < 2) {
        this.playerDeath('You were caught by the deformed!')
      }
    })

    // Check collectible proximity
    this.collectibles.forEach((collectible) => {
      collectible.update()
      if (this.player.mesh.position.distanceTo(collectible.mesh.position) < 2) {
        collectible.collect()
        this.uiSystem.updateCollected(this.getCollectedCount())
      }
    })

    // Update UI
    this.uiSystem.updatePosition(this.player.mesh.position)
    this.uiSystem.updateHealth(this.player.health)

    // Check nearby enemies for warning
    const nearestEnemy = this.getNearestEnemy()
    if (nearestEnemy && nearestEnemy.distance < 15) {
      document.getElementById('warning')!.style.display = 'block'
    } else {
      document.getElementById('warning')!.style.display = 'none'
    }

    // Render
    this.renderer.render(this.scene, this.camera)

    requestAnimationFrame(this.gameLoop)
  }

  private getNearestEnemy(): { distance: number; enemy: Deformed } | null {
    let nearest = null
    let minDist = Infinity

    this.enemies.forEach((enemy) => {
      const dist = this.player.mesh.position.distanceTo(enemy.mesh.position)
      if (dist < minDist) {
        minDist = dist
        nearest = enemy
      }
    })

    return nearest ? { distance: minDist, enemy: nearest } : null
  }

  private playerDeath(reason: string): void {
    this.isRunning = false
    const gameOverScreen = document.getElementById('game-over')
    if (gameOverScreen) {
      gameOverScreen.classList.add('active')
      document.getElementById('game-over-text')!.textContent = reason
    }
  }

  private getCollectedCount(): number {
    return this.collectibles.filter(c => c.collected).length
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}
