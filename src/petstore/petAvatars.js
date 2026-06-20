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

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function petEmoji(pet) {
  const cat = (pet?.category?.name || '').trim().toLowerCase()
  if (cat && CATEGORY_MAP[cat]) return CATEGORY_MAP[cat]
  const key = (pet?.name || cat || 'pet').toLowerCase()
  return EMOJI[hash(key) % EMOJI.length]
}
