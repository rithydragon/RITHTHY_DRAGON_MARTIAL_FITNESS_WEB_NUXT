import json from '~/assets/json/menu_data.json'

export default async () => {
  const result = {
    navbar: [],
    contact: [],
    footer: [],
  }

  try {
    const staticMenus = json ?? []

    const allMenu = [...staticMenus]

    for (const item of allMenu) {
      if (item.section === 'navbar') {
        result.navbar = item.navbar_menu ?? []
      }

      if (item.section === 'contact') {
        result.contact = item.contact ?? []
      }

      if (item.section === 'footer') {
        result.footer = item.footer ?? []
      }
      if (item.section === 'service') {
        result.service = item.service ?? []
      }
    }

    return result
  } catch (e) {
    console.error('❌ Menu fetch error:', e)

    return result
  }
}