import { config } from '@vue/test-utils'
import { vi, beforeEach } from 'vitest'

// Mock modules that cause issues in testing
vi.mock('@/assets/img/play-button-icon.png', () => ({
  default: '/mocked-play-button.png'
}))

vi.mock('@/assets/img/no-image-icon.png', () => ({
  default: '/mocked-no-image.png'
}))

// Mock require for assets (since some components use require instead of import)
const originalRequire = globalThis.require
globalThis.require = vi.fn((id: string) => {
  if (id.includes('@/assets/img/play-button-icon.png')) {
    return '/mocked-play-button.png'
  }
  if (id.includes('@/assets/img/no-image-icon.png')) {
    return '/mocked-no-image.png'
  }
  // For any other asset files
  if (id.includes('@/assets/')) {
    return '/mocked-asset.png'
  }
  if (originalRequire) {
    return originalRequire(id)
  }
  throw new Error(`Cannot find module '${id}'`)
})

const mockPlayers: Record<string, any> = {}

const createMockPlayer = (element: any, options?: any) => {
  const player = {
    ready: vi.fn((callback: any) => callback()),
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

const mockVideoJs = vi.fn(createMockPlayer) as any
mockVideoJs.getPlayers = vi.fn(() => mockPlayers)

vi.mock('video.js', () => ({
  default: mockVideoJs,
}))

// Mock FileReader for file uploads
interface MockFileReader {
  onload: ((event: any) => void) | null;
  readAsDataURL(): void;
}

(globalThis as any).FileReader = class MockFileReader implements MockFileReader {
  onload: ((event: any) => void) | null = null;
  
  readAsDataURL() {
    if (typeof this.onload === 'function') {
      this.onload({ target: { result: 'data:mock' } });
    }
  }
}

// Global test setup
config.global.mocks = {
  $videojs: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})
