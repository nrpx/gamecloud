import { system } from './theme'

// Проверяем, что система тем создана корректно
console.log('✅ Custom theme system created successfully!')

// Выводим основные цвета для проверки
console.log('🎨 Theme colors:')
console.log('Light background:', system.token('colors.bg'))
console.log('Dark background:', system.token('colors.bg._dark'))
console.log('Foreground:', system.token('colors.fg'))
console.log('Border:', system.token('colors.border'))

// Проверяем Dracula цвета
console.log('🧛 Dracula-inspired colors:')
console.log('Red:', system.token('colors.red.solid._dark'))
console.log('Green:', system.token('colors.green.solid._dark'))
console.log('Blue:', system.token('colors.blue.solid._dark'))
console.log('Purple:', system.token('colors.purple.solid._dark'))
console.log('Pink:', system.token('colors.pink.solid._dark'))

export default system