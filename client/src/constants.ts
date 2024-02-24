import oneColor from './assets/logos/one-color.svg'
import oneOutline from './assets/logos/one-grey.svg'
import {type UserTopic, UserTopicType} from "./types";

export const baseTopicList = [
  { name: 'uni', group: 1, type: 'blockchain'},
  { name: 'aave', group: 1, type: 'blockchain'},
  { name: 'comp', group: 1, type: 'blockchain'},
  { name: 'mkr', group: 1, type: 'blockchain'},
  { name: 'dai', group: 1, type: 'blockchain'},
  { name: 'crv', group: 1, type: 'blockchain'},
  { name: 'zrx', group: 1, type: 'blockchain'},
  { name: '1inch', group: 1, type: 'blockchain'},
  { name: 'fxs', group: 1, type: 'blockchain'},
  { name: 'dydx', group: 1, type: 'blockchain'},
  { name: 'snx', group: 1, type: 'blockchain'},
  { name: 'ftm', group: 1, type: 'blockchain'},
  { name: 'ens', group: 1, type: 'blockchain'},
  { name: 'blur', group: 1, type: 'blockchain'},
  { name: 'ape', group: 1, type: 'blockchain'},
  { name: 'imx', group: 1, type: 'blockchain'},

  // group 2
  { name: 'btc', group: 2, type: 'blockchain'},
  { name: 'one', group: 2, type: 'blockchain'},
  { name: 'sol', group: 2, type: 'blockchain'},
  { name: 'near', group: 2, type: 'blockchain'},
  { name: 'eth', group: 2, type: 'blockchain'},
  { name: 'base', group: 2, type: 'blockchain'},
  { name: 'arb', group: 2, type: 'blockchain'},
  { name: 'op', group: 2, type: 'blockchain'},

  // group 3
  { name: 'rune', group: 3, type: 'blockchain'},
  { name: 'stx', group: 3, type: 'blockchain'},
  { name: 'ordi', group: 3, type: 'blockchain'},
  { name: 'stats', group: 3, type: 'blockchain'},
  { name: 'tia', group: 3, type: 'blockchain'},
  { name: 'atom', group: 3, type: 'blockchain'},
  { name: 'ar', group: 3, type: 'blockchain'},
  { name: 'axl', group: 3, type: 'blockchain'},
  { name: 'ton', group: 3, type: 'blockchain'},
  { name: 'mina', group: 3, type: 'blockchain'},
  { name: 'gno', group: 3, type: 'blockchain'},
  { name: 'celo', group: 3, type: 'blockchain'},
  { name: 'lrc', group: 3, type: 'blockchain'},
  { name: 'gmx', group: 3, type: 'blockchain'},
  { name: 'cake', group: 3, type: 'blockchain'},
  { name: 'sushi', group: 3, type: 'blockchain'},
]

export const getTopicLits = async (): Promise<UserTopic[]> => {
  // const colorPath = './assets/logos'

  const logoPromises = baseTopicList.map(async (logo) => {
    try {
      // const logoName = logo.name
      // const [logoColor, logoLight] = await Promise.all([
      //     import(`${colorPath}/${logoName}-color.svg`),
      //     import(`${colorPath}/${logoName}-grey.svg`),
      //     // import(`${colorPath}/${logoName}-white.svg`)

      // ]);
      return {
        name: logo.name,
        light: null, // logoLight.default,
        color: null, // logoColor.default,
        type: logo.type as UserTopicType,
        group: logo.group
    };
    } catch(e) {
      console.log(e)
      return {
          name: logo.name,
          light: oneOutline, // oneOutline, // placeholder,
          color: oneColor, // placeholder,
          type: logo.type as UserTopicType,
          group: logo.group
      }
    }
  })

  return await Promise.all(logoPromises)
}


