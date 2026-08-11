// import { defineStore, acceptHMRUpdate } from "#imports";
// import { isEmpty } from "lodash"; // or define your own isEmpty function

// export const UseDefaultImageStore = defineStore("DefaultImagStore", {
//   actions: {
//     get(event, type) {
//       if (isEmpty(type) || type == "img")
//         event.target.src = "/img/default-no-img.png";
//       else event.target.src = "/img/default-user.png";
//     },
//   },
// });
// if (import.meta.hot) {
//   import.meta.hot.accept(acceptHMRUpdate(UseDefaultImageStore, import.meta.hot));
// }


// Optional: If you don’t want to use lodash, see below for a plain `isEmpty` version
// import { isEmpty } from 'lodash'
// import { defineStore } from 'pinia'
// import { acceptHMRUpdate } from 'pinia'

// function isEmpty(value) {
//   return (
//     value === null ||
//     value === undefined ||
//     (typeof value === 'string' && value.trim() === '')
//   )
// }

// export const UseDefaultImagStore = defineStore('defaultImageStore', {
//   actions: {
//     get(event, type) {
//       const target = event.target

//       if (!target || !target.tagName || target.tagName !== 'IMG') return

//       const fallbackMap = {
//         img: '/images/defualtProfile.png',
//         user: '/img/default-user.png',
//         avatar: '/img/default-avatar.png',
//         banner: '/img/default-banner.png',
//         product: '/img/default-product.png',
//       }

//       // Fallback for unknown or empty types
//       const fallback = fallbackMap[type] || fallbackMap['img']
//       target.src = fallback
//     },
//   },
// })

// if (import.meta.hot) {
//   import.meta.hot.accept(acceptHMRUpdate(UseDefaultImageStore, import.meta.hot))
// }

import { defineStore,acceptHMRUpdate } from 'pinia'

export const UseDefaultImageStore = defineStore('defaultImageStore', {
  
  actions: {
    
    get(event, type = 'img') {
      const target = event?.target
      if (!target || target.tagName !== 'IMG') return
      console.log("Type image =======================================> ", type)
      const fallbackMap = {
        //  user: new URL('../assets/imgs/default-user.png', import.meta.url).href,
        // avatar: new URL('../assets/imgs/default-avatar.png', import.meta.url).href,
        img: new URL('../assets/imgs/placeholder.png', import.meta.url).href,
        user: new URL('../assets/imgs/profile_female.png', import.meta.url).href,
        avatar: new URL('../assets/imgs/profile_female.png', import.meta.url).href,
        female: new URL('../assets/imgs/profile_female.png', import.meta.url).href,
        f: new URL('../assets/imgs/profile_female.png', import.meta.url).href,
        male: new URL('../assets/imgs/profile_male.png', import.meta.url).href,
        m: new URL('../assets/imgs/profile_male.png', import.meta.url).href,
        banner: new URL('../assets/imgs/default-banner.png', import.meta.url).href,
        product: new URL('../assets/imgs/default-product.png', import.meta.url).href,
      }

      // fallbackMap1  
      // const fallbackMap = {
      //   img: '/imgs/defaultProfile.png',
      //   user: '/imgs/default-user.png',
      //   avatar: '/imgs/default-avatar.png',
      //   banner: '/imgs/default-banner.png',
      //   product: '/imgs/default-product.png',
      // }

      target.src = fallbackMap[type] || fallbackMap.img
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(UseDefaultImageStore, import.meta.hot))
}