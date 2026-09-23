// import { ref } from "vue";
// const secretKey = "rdmfuserdata";
// const key = "user_data";

// export const useUserData = (val) => {
//   try {
//     if (isNotEmpty(val) && typeof val == "object") {
//       const data = encryptAES(JSON.stringify(val), secretKey);

//       useCookie(key, {
//         // maxAge: val.expires_in,
//       }).value = data;

//       return ref(val);
//     } else {
//       const data = useCookie(key).value;

//       if (isNotEmpty(data)) {
//         return ref(JSON.parse(decryptAES(data, secretKey)));
//       } else {
//         throw "Error";
//       }
//     }
//   } catch (e) {
//     return ref(null);
//   }
// };
import { ref } from "vue";
const secretKey = "rtyuserdata";
const key = "rty_user_data";

export const useUserData = (val) => {
  try {
    if (isNotEmpty(val) && typeof val == "object") {
      const data = encryptAES(JSON.stringify(val), secretKey);

      useCookie(key, {
        // maxAge: val.expires_in,
      }).value = data;
      useCookie("access_token").value = val.access_token;
      useCookie("refresh_token").value = val.refresh_token;
      return ref(val);
    } else {
      const data = useCookie(key).value;

      if (isNotEmpty(data)) {
        return ref(JSON.parse(decryptAES(data, secretKey)));
      } else {
        throw "Error";
      }
    }
  } catch (e) {
    return ref(null);
  }
};
