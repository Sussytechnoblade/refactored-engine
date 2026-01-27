import { GameEngine } from './game/GameEngine'

const game = new GameEngine()

// Make game instance globally available for UI functions
(window as any).gameInstance = game

// Expose UI functions globally
(window as any).closeLoreEntry = () => {
  const entry = document.getElementById('lore-entry')
  if (entry) {
    entry.classList.remove('active')
  }
  game.resumeGame()
}

// Start the game
game.start()
