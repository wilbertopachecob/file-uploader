import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// Mock modules that cause issues in testing
vi.mock('@/assets/img/play-button-icon.png', () => ({
  default: '/mocked-play-button.png'
}))

const mockPlayers = {}

const createMockPlayer = (element: any, options?: any) => {
  const player = {
    ready: vi.fn((callback) => callback()),
    play: vi.fn(),
    pause: vi.fn(),
    dispose: vi.fn(),
    el: () => element,
  }
  if (typeof element === 'string') {
    mockPlayers[element] = player
  }
  return player
}

const mockVideoJs = vi.fn(createMockPlayer)
mockVideoJs.getPlayers = vi.fn(() => mockPlayers)

vi.mock('video.js', () => ({
  default: mockVideoJs,
}))

// Mock FileReader for file uploads
global.FileReader = class MockFileReader {
  constructor() {
    this.onload = null;
  }
  readAsDataURL() {
    if (typeof this.onload === 'function') {
      this.onload({ target: { result: 'data:mock' } });
    }
  }
} as any

// Global test setup
config.global.mocks = {
  $videojs: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})
