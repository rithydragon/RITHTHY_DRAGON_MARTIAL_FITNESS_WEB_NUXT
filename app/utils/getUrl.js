export default (path, isWeb) => {
  if (!path) return "";

  const { config } = helper();
  const runtimeConfig = useRuntimeConfig();

  const tmpServer = useCookie("tmp_server").value;
  const tmpWebServer = useCookie("tmp_web_server").value;

  if (path.toLowerCase().startsWith("http")) return path;

  if (!path.startsWith("/")) path = `/${path}`;

  const runtimeServer = isWeb
    ? runtimeConfig.public.siteUrl || config.webUrl
    : runtimeConfig.public.apiBase || config.apiUrl;

  let server = isWeb
    ? isNotEmpty(tmpWebServer) ? tmpWebServer : runtimeServer
    : isNotEmpty(tmpServer)   ? tmpServer    : runtimeServer;

  server = server?.endsWith("/") ? server.replace(/\/$/, "") : server;

  return `${server}${path}`;
};
