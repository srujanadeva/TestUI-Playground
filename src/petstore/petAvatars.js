// Picks the emoji shown as a pet's avatar on its card.

// Fallback avatars for categories not in CATEGORY_MAP.
const EMOJI = ['🐶', '🐱', '🐰', '🐹', '🦊', '🐢', '🐠', '🦜', '🐸', '🐯', '🐻', '🐼', '🐨', '🐷', '🦄']

const CATEGORY_MAP = {
  dog: '🐶',
  dogs: '🐶',
  puppy: '🐶',
  cat: '🐱',
  cats: '🐱',
  kitten: '🐱',
  rabbit: '🐰',
  bunny: '🐰',
  hamster: '🐹',
  fox: '🦊',
  turtle: '🐢',
  tortoise: '🐢',
  fish: '🐠',
  bird: '🦜',
  parrot: '🦜',
  frog: '🐸',
  tiger: '🐯',
  bear: '🐻',
  panda: '🐼',
  koala: '🐨',
  pig: '🐷',
}

/**
 * A small, stable, non-negative number for a string (Java-style string hash).
 * `| 0` keeps it a 32-bit integer so long names can't overflow into imprecise floats.
 */
function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

/**
 * The avatar emoji for a pet: the one for its category when it is a known animal,
 * otherwise one picked from the pet's name, so the same pet always gets the same emoji.
 * @param pet A pet as returned by the API.
 */
export function petEmoji(pet) {
  const cat = (pet?.category?.name || '').trim().toLowerCase()
  if (cat && CATEGORY_MAP[cat]) return CATEGORY_MAP[cat]
  const key = (pet?.name || cat || 'pet').toLowerCase()
  return EMOJI[hash(key) % EMOJI.length]
}
