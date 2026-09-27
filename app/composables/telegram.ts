/**
 * Telegram deep links.
 *
 * Two independent formats — a user can have one, both, or neither:
 *   https://t.me/<username>        — public username link
 *   https://t.me/+<phone digits>   — phone-number link (note the "+"),
 *                                    only resolves if the person's privacy
 *                                    settings allow discovery by phone.
 */

export interface TelegramLinkUser {
  username?: string | null
  phone?: string | null
}

export interface TelegramLinks {
  telegram?: string
  telegramPhone?: string
}

/**
 * Strip a leading '@' and surrounding whitespace. Telegram usernames are
 * 5–32 chars, [A-Za-z0-9_], must start with a letter — this only guards
 * against the common '@handle' paste, it doesn't fully validate the format.
 */
function sanitizeUsername(raw: string | null | undefined): string {
  return (raw || '').trim().replace(/^@/, '')
}

/**
 * Keep digits only. Handles '+855 12 345 678', '855-12-345-678',
 * '(855) 12 345 678', etc. — anything with a parseable digit sequence.
 */
function sanitizePhoneDigits(raw: string | null | undefined): string {
  return (raw || '').replace(/\D/g, '')
}

export function buildTelegramLinks(user: TelegramLinkUser | null | undefined): TelegramLinks {
  const links: TelegramLinks = {}
  if (!user) return links

  const username = sanitizeUsername(user.username)
  if (username) {
    links.telegram = `https://t.me/${username}`
  }

  const digits = sanitizePhoneDigits(user.phone)
  if (digits) {
    links.telegramPhone = `https://t.me/+${digits}`
  }

  return links
}
