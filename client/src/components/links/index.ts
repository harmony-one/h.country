// And no, providerName and displayName are not the same, they will be changed later for oAuth so don't remove one or the other
export const predefinedLinks = [
    { key: "x", displayName: "twitter", providerName: "twitter" },
    { key: "ig", displayName: "instagram", providerName: "instagram" },
    { key: "g", displayName: "github", providerName: "github" },
    { key: "f", displayName: "facebook", providerName: "facebook" },
    { key: "l", displayName: "linkedIn", providerName: "linkedin" },
    { key: "t", displayName: "telegram", providerName: "telegram" },
    { key: "s", displayName: "substack", providerName: "substack" },
  ];

  interface RegexObject {
    type: string; // a all lowercase no space name of the social media site
    providerName: string; // the formatted official name of the social media site
    regex: RegExp; // the regex that will be used to find the username
    baseUrl: string;
    deprecated?: boolean; // if the social media site is deprecated (like shutdown or rebranded)
  }

  export const regexes: RegexObject[] = [
    {
      type: 'g',
      providerName: 'github',
      regex: /(?:https?:\/\/(?:www\.)?github.com\/)?([^\n "/]+)/gi,
      baseUrl: 'https://github.com/'
    },
    {
        type: 'ig',
        providerName: 'instagram',
        regex: /(?:https?:\/\/(?:www\.)?instagram.com\/)?([^\n "/]+)/gi,
        baseUrl: 'https://www.instagram.com/'
    },
    {
        type: 'f',
        providerName: 'facebook',
        // eslint-disable-next-line no-useless-escape
        regex: /(?:https?:\/\/(?:[_a-z]{0,3}\.|[_a-z]{2}-[_a-z]{2}\.)?(facebook|fb).com\/(?:groups\/)?)?([^\/\n "]+)\/?/gi,
        baseUrl: 'https://www.facebook.com/'
    },
    {
        type: 'l',
        providerName: 'linkedin',
        // eslint-disable-next-line no-useless-escape
        regex: /(?:https?:\/\/(?:[_a-z]{0,3}\.)?linkedin.com\/(?:in|pub|company|school)\/)?([^\/\n?]+)/gi,
        baseUrl: 'https://www.linkedin.com/in/'
    },
    {
        type: 't',
        providerName: 'telegram',
        regex: /(?:https?:\/\/(?:www\.)?(?:(?:t|telegram).me\/|telegram.dog\/|web.telegram.org\/[ak]\/#@?)?)?([^\n "/]+)/gi,
        baseUrl: 'https://t.me/'
    },
    {
        type: 'x',
        providerName: 'twitter',
        // eslint-disable-next-line no-useless-escape
        regex: /(?:https?:\/\/(?:(www|mobile)\.)?(twitter|x).com\/)?([^\/\n "]+)\/?/gi,
        baseUrl: 'https://twitter.com/'
    },
    {
        type: 's',
        providerName: 'substack',
        regex: /(https?:\/\/)?([a-zA-Z0-9-]+).substack.com\/?/gi,
        baseUrl: 'https://substack.com/@'
    },
    /* // OTHER
    { type: 'aboutme', name: 'About.me', regex: /https?:\/\/(?:www\.)?about\.me\/([^\n "/]+)/gi },
    { type: 'angellist', name: 'AngelList', regex: /https?:\/\/(?:www\.)?angel\.co\/([^\n "/]+)/gi },
    { type: 'behance', name: 'Behance', regex: /https?:\/\/(?:www\.)?behance\.(com|net)\/([^\n "/]+)/gi },
    { type: 'blogger', name: 'Blogger', regex: /https?:\/\/(?:www\.)?blogger\.com\/profile\/([^\n "/]+)/gi },
    { type: 'crunchbase', name: 'CrunchBase', regex: /https?:\/\/(?:www\.)?crunchbase\.com\/(person|company|organization)\/([^\n "/]+)/gi },
    { type: 'digg', name: 'Digg', regex: /https?:\/\/(?:www\.)?digg\.com\/users\/([^\n "/]+)/gi },
    { type: 'dribbble', name: 'Dribbble', regex: /https?:\/\/(?:www\.)?dribbble\.com\/([^\n "/]+)/gi },
    { type: 'flickr', name: 'Flickr', regex: /https?:\/\/(?:www\.)?flickr\.com\/(people|photos|groups)\/([^\n "/]+)/gi },
    { type: 'foursquare', name: 'Foursquare', regex: /https?:\/\/(?:www\.)?foursquare\.com\/(?!user)([^\n "/]+)/gi },
    
    // google
    {
        type: 'googleplus', name: 'Google Plus', regex: /https?:\/\/plus\.google\.com\/\+?([^\n "/]+)/gi, deprecated: true,
    },
    { type: 'youtube', name: 'YouTube', regex: /https?:\/\/([_a-z]{0,3}\.)?youtube\.com\/(user\/|channel\/|c\/)?([^\n "/]+)/gi },

    // https://faq.whatsapp.com/5913398998672934/?locale=nl_NL
    { type: 'whatsapp', name: 'WhatsApp', regex: /(?:https?:\/\/)?(?:www\.)?wa\.me\/(\d+)/gi },

    { type: 'gravatar', name: 'Gravatar', regex: /https?:\/\/([_a-z]{0,3}\.)?gravatar\.com\/([^\n "/]+)/gi },
    { type: 'keybase', name: 'Keybase', regex: /https?:\/\/(?:www\.)?keybase\.io\/([^\n "/]+)/gi },
    { type: 'klout', name: 'Klout', regex: /https?:\/\/(?:www\.)?klout\.com\/([^\n "/]+)/gi },
    { type: 'lastfm', name: 'Last.FM', regex: /https?:\/\/(?:www\.)?(last\.fm|lastfm\.com)\/user\/([^\n "/]+)/gi },
    { type: 'medium', name: 'Medium', regex: /https?:\/\/(?:www\.)?medium\.com\/@?([^\n "/]+)/gi },
    { type: 'myspace', name: 'MySpace', regex: /https?:\/\/(?:www\.)?myspace\.com\/([^\n "/]+)/gi },
    { type: 'ok', name: 'Odnoklassniki', regex: /https?:\/\/(?:www\.)?ok\.ru\/(profile\/)?([^\n "/]+)/gi },

    // TODO: Find real life example
    { type: 'pandora', name: 'Pandora', regex: /https?:\/\/(?:www\.)?pandora\.com\/people\/([^\n "/]+)/gi },

    { type: 'pinterest', name: 'Pinterest', regex: /https?:\/\/([_a-z]{0,3}\.)?pinterest\.[.a-z]+\/([^\n +/]+)/gi },
    { type: 'quora', name: 'Quora', regex: /https?:\/\/(?:www\.)?quora\.com\/(profile\/)?([^\n "/]+)/gi },

    // reddit
    { type: 'reddit', name: 'Reddit', regex: /https?:\/\/(?:www\.)?reddit\.com\/(user)?(u)?\/([^\n "/]+)/gi },
    { type: 'subreddit', name: 'subreddit', regex: /https?:\/\/www\.?reddit\.com\/r\/?([a-z]+)\/?/gi },

    { type: 'slideshare', name: 'Slideshare', regex: /https?:\/\/(?:www\.)?slideshare\.net\/([^\n "/]+)/gi },
    { type: 'tiktok', name: 'Tiktok', regex: /https?:\/\/(?:www\.)?tiktok.com\/@([^\n "/]+)/gi },
    { type: 'tumblr', name: 'Tumblr', regex: /https?:\/\/([\da-z]+)\.tumblr\.com/gi },
    { type: 'vimeo', name: 'Vimeo', regex: /https?:\/\/(?:www\.)?vimeo\.com\/([^\n "/]+)/gi },
    { type: 'vk', name: 'VK', regex: /https?:\/\/(?:www\.)?vk\.com\/([^\n "/]+)/gi },
    { type: 'wordpress', name: 'Wordpress', regex: /https?:\/\/(?!subscribe)([\da-z]+)\.wordpress\.com/gi },
    { type: 'xing', name: 'Xing', regex: /https?:\/\/(?:www\.)?xing\.com\/(profile\/)([^\n "/]+)/gi },
    { type: 'yahoo', name: 'Yahoo', regex: /https?:\/\/((profile|me|local)\.)?yahoo\.com\/([^\n "/]+)/gi },

    // yelp
    { type: 'yelpUser', name: 'Yelp User', regex: /https?:\/\/(www\.)?yelp\.[a-z]+\/user_details\?userid=([\da-z-]+)/gi },
    { type: 'yelpBusiness', name: 'Yelp Business', regex: /https?:\/\/www\.?yelp\.[a-z]+\/biz\/([\da-z-]+)/gi },

    // amazon (not a social media site, but it's a profile)
    { type: 'amazonWishlist', name: 'Amazon wishlist', regex: /https?:\/\/www\.?amazon\.[a-z]+\/gp\/?registry\/?wishlist\/?([^\n "/]+)/gi },

    // weibo
    { type: 'weibo', name: 'Weibo', regex: /https?:\/\/(?:www\.)?weibo\.com\/(u\/)?([^\n "/]+)/gi },

    // Steam
    { type: 'steam', name: 'Steam', regex: /https?:\/\/(?:www\.)?steamcommunity\.com\/(id|profiles)\/([^\n "/]+)/gi },

    // WeChat
    { type: 'wechat', name: 'WeChat', regex: /https?:\/\/(?:www\.)?open\.weixin\.qq\.com\/qr\/code\?username=([^\n "/]+)|weixin:\/\/dl\/chat\?([^\n "/]+)/gi },

    // Snapchat
    { type: 'snapchat', name: 'Snapchat', regex: /https?:\/\/(?:www\.)?snapchat\.com\/add\/([^\n "/]+)/gi },

    // Douyin
    { type: 'douyin', name: 'Douyin', regex: /https?:\/\/(?:www\.)?douyin\.com\/user\/([^\n "/]+)/gi },

    // Kuaishou
    { type: 'kuaishou', name: 'Kuaishou', regex: /https?:\/\/(?:www\.)?kuaishou\.com\/profile\/([^\n "/]+)/gi },

    // Tencent qq
    { type: 'qq', name: 'QQ', regex: /https?:\/\/user\.qzone\.qq\.com\/([1-9]\d*)/gi },

    // Spotify
    { type: 'spotifyUser', name: 'Spotify User', regex: /https?:\/\/(?:www\.)?open\.spotify\.com\/user\/([^\n "/]+)/gi },
    { type: 'spotifyArtist', name: 'Spotify Artist', regex: /https?:\/\/(?:open|play)\.spotify\.com\/artist\/([0-7][\da-z]{21})|spotify:artist:([0-7][\da-z]{21})|https?:\/\/shop.spotify.com\/[a-z]{2}\/artist\/([0-7][\da-z]{21})\/(?:store)?/gi },
    */
];