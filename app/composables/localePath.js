import { useLocalePath, useCookie } from "#imports";
export default (path) => {
  // console.log("Path =================> ", path)
  const cookie = useCookie("i18n_redirected").value;
  // console.log("Cookie ==============> ", cookie)
  return cookie != "en" ? `/${cookie}${path}` : path;
};
