import apis from '../helpers/apis';
import str from '../helpers/str';
import config from '../helpers/config';
import globalHelper from './globalhelper';

export default () => {
  const gHelper = globalHelper();

  return {
    str: { ...gHelper.str, ...str },
    config: { ...gHelper.config, ...config },
    api: { ...gHelper.api, ...apis }, 
  };
};
