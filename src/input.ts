// Shared pressed-key state so keyboard events and on-screen touch controls
// feed the same movement logic in AvatarControls.
const pressed = new Set<string>()

export const input = {
  press(key: string) {
    pressed.add(key)
  },
  release(key: string) {
    pressed.delete(key)
  },
  pressedKeys: (): Set<string> => pressed,
}
